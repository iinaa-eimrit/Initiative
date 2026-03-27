import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  skills: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: string;
  skills?: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  const updateToken = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("auth_token", newToken);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        updateToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token, updateToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Login failed");
    }
    const data = await res.json();
    updateToken(data.token);
    setUser(data.user);
  }, [updateToken]);

  const signup = useCallback(async (signupData: SignupData) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Signup failed");
    }
    const data = await res.json();
    updateToken(data.token);
    setUser(data.user);
  }, [updateToken]);

  const logout = useCallback(() => {
    updateToken(null);
    setUser(null);
  }, [updateToken]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
