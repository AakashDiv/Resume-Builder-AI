import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ADMIN_TOKEN_KEY = "superadmin_token";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));

  const adminLogin = useCallback((newToken) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAdminAuthenticated: Boolean(token), adminLogin, adminLogout }),
    [token, adminLogin, adminLogout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
