import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextValue {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("raijin_logged_in") === "true";
  });

  function login() {
    localStorage.setItem("raijin_logged_in", "true");
    setIsLoggedIn(true);
  }

  function logout() {
    localStorage.removeItem("raijin_logged_in");
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
