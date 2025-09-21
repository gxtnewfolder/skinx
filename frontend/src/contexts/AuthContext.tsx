"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { isTokenExpired, clearAuth } from "@/utils/auth";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const refreshAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Verify token is still valid by making a test API call
        const userData = await api<User>("/auth/me");
        setUser(userData);
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem("token");
        setUser(null);
        console.log("Token validation failed:", error);
      }
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      await refreshAuth();
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    setUser(data.user);
    
    // Handle redirect after successful login
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    if (redirectPath) {
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPath;
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  // Handle automatic logout on token expiration
  useEffect(() => {
    const handleTokenExpiration = () => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        console.log("Token expired, logging out user");
        clearAuth();
        setUser(null);
      }
    };

    // Check token expiration immediately and then every minute
    handleTokenExpiration();
    const interval = setInterval(handleTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, []); // Run once on mount and set up interval

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}