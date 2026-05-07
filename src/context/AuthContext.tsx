import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/types/database";
import { supabase } from "@/lib/supabase";

// ── helpers ───────────────────────────────────────────────────────────────────

const SESSION_KEY = "prodex_user";

const AGENT_DEBUG_URL = import.meta.env.DEV
  ? "/__agent-debug"
  : "http://127.0.0.1:7514/ingest/0686c71f-005f-4e9b-a7c7-9eb963402290";

function agentDebugPost(body: Record<string, unknown>) {
  fetch(AGENT_DEBUG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "22a7bd" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** SHA-256 hash menggunakan Web Crypto API (native browser, no library) */
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── context type ──────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

// ── context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session dari sessionStorage saat app pertama load
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      // #region agent log
      agentDebugPost({
        sessionId: "22a7bd",
        runId: "run1",
        hypothesisId: "H1",
        location: "src/context/AuthContext.tsx:restore_session",
        message: "Session restoration started",
        data: { hasStoredSession: Boolean(stored) },
        timestamp: Date.now(),
      });
      // #endregion
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Login: cari email di tabel users, bandingkan hash password.
   *  Return null jika sukses, atau string pesan error. */
  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!email.trim() || !password) return "Email dan password wajib diisi.";
      const normalizedEmail = email.toLowerCase().trim();
      // #region agent log
      agentDebugPost({
        sessionId: "22a7bd",
        runId: "run1",
        hypothesisId: "H2",
        location: "src/context/AuthContext.tsx:login_start",
        message: "Login query prepared",
        data: { normalizedEmailLength: normalizedEmail.length },
        timestamp: Date.now(),
      });
      // #endregion

      const hash = await sha256(password);

      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, password_hash")
        .eq("email", normalizedEmail)
        .maybeSingle(); // ← jadi ini
      // #region agent log
      agentDebugPost({
        sessionId: "22a7bd",
        runId: "run1",
        hypothesisId: "H3",
        location: "src/context/AuthContext.tsx:login_query_result",
        message: "Login query completed",
        data: {
          hasError: Boolean(error),
          hasData: Boolean(data),
          returnedKeys: data ? Object.keys(data) : [],
          supabaseErrorCode: error?.code ?? null,
          supabaseErrorMessage: error?.message ?? null,
          clientHashLen: hash.length,
          serverHashLen:
            data && typeof data === "object" && "password_hash" in data &&
            typeof (data as { password_hash?: unknown }).password_hash === "string"
              ? (data as { password_hash: string }).password_hash.length
              : null,
        },
        timestamp: Date.now(),
      });
      // #endregion

      if (error || !data) return "Email tidak ditemukan.";
      if (data.password_hash !== hash) return "Password salah.";

      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        name: data.name,
      };
      // #region agent log
      agentDebugPost({
        sessionId: "22a7bd",
        runId: "run1",
        hypothesisId: "H4",
        location: "src/context/AuthContext.tsx:login_success",
        message: "Login success path reached",
        data: { userId: authUser.id },
        timestamp: Date.now(),
      });
      // #endregion
      setUser(authUser);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      return null; // sukses
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
