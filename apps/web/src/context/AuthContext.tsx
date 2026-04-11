import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@anime-app/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const STORAGE_KEY = "raijin_auth";

interface StoredAuth {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(loadStoredAuth);

  function persist(data: StoredAuth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
  }

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Login failed.");
    persist(json.data as StoredAuth);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Registration failed.");
    persist(json.data as StoredAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ user: auth?.user ?? null, isLoggedIn: !!auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
