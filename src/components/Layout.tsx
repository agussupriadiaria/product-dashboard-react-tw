import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Zap,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* Logo */}
        <div className="border-b border-[var(--color-border)] px-6 py-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)]">
              <Zap size={18} color="white" />
            </div>
            <div>
              <div
                className="text-base font-bold leading-none text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                PRODEX
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Menu
          </div>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 no-underline transition-all duration-150"
                style={{
                  background: isActive ? "rgba(108, 99, 255, 0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(108, 99, 255, 0.3)" : "1px solid transparent",
                  color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                }}
              >
                <Icon size={17} />
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-[var(--color-border)] px-3 py-4">
          {/* User badge */}
          <div className="flex items-center gap-2.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5">
            <UserCircle2 size={18} color="var(--color-accent)" />
            <div className="min-w-0 flex-1">
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {user?.name ?? "—"}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--color-text-muted)]">
                {user?.email ?? "—"}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-transparent px-3 py-2 text-[13px] font-medium text-[var(--color-text-muted)] transition-all duration-150 hover:border-[rgba(255,101,132,0.2)] hover:bg-[rgba(255,101,132,0.08)] hover:text-[var(--color-accent-2)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <LogOut size={14} />
            Keluar
          </button>

          <div className="flex items-center gap-1.5 px-1">
            <TrendingUp size={12} color="var(--color-accent-3)" />
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Powered by Supabase
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex min-h-screen flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
