// ── Auth ──────────────────────────────────────────────────
export type User = {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at?: string;
};

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

// ── Products ──────────────────────────────────────────────
export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  created_at?: string;
};

export type ProductInsert = Omit<Product, "id" | "created_at">;
export type ProductUpdate = Partial<ProductInsert>;

export interface CategoryStat {
  category: string;
  count: number;
  totalValue: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStock: number;
  categories: CategoryStat[];
}

export type SortField = "name" | "price" | "stock" | "category";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [];
      };
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
