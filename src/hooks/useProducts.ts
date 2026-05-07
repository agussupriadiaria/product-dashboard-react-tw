import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Product,
  ProductInsert,
  ProductUpdate,
  FilterState,
  DashboardStats,
  CategoryStat,
} from "@/types/database";

export function useProducts(filters: FilterState) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("products").select("*");

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.minPrice) {
        query = query.gte("price", parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte("price", parseFloat(filters.maxPrice));
      }

      query = query.order(filters.sortField, {
        ascending: filters.sortOrder === "asc",
      });

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      setProducts(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortField,
    filters.sortOrder,
  ]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("products")
        .select("category")
        .order("category");

      if (data) {
        const unique = [...new Set(data.map((d) => d.category))];
        setCategories(unique);
      }
    };
    void fetchCategories();
  }, []);

  return categories;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("products").select("*");

      if (!data) return;

      const totalProducts = data.length;
      const totalValue = data.reduce((sum, p) => sum + p.price * p.stock, 0);
      const lowStock = data.filter((p) => p.stock < 10).length;

      const categoryMap = new Map<string, CategoryStat>();
      data.forEach((p) => {
        const existing = categoryMap.get(p.category);
        if (existing) {
          existing.count++;
          existing.totalValue += p.price * p.stock;
        } else {
          categoryMap.set(p.category, {
            category: p.category,
            count: 1,
            totalValue: p.price * p.stock,
          });
        }
      });

      setStats({
        totalProducts,
        totalValue,
        lowStock,
        categories: Array.from(categoryMap.values()),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export async function createProduct(product: ProductInsert) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, updates: ProductUpdate) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
