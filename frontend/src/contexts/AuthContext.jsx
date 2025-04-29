import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/users/auth/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Authentication check failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.isAuthenticated) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear token if it's invalid
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError("");
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      // Save user info and token
      setCurrentUser(data.user);
      setIsAuthenticated(true);

      // Store token in localStorage
      if (data.user.token) {
        localStorage.setItem("authToken", data.user.token);
      }

      return data;
    } catch (error) {
      setError(error.message || "Login failed");
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError("");
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();

      // If registration includes auto-login
      setCurrentUser(data.user);
      setIsAuthenticated(true);

      // Store token if provided
      if (data.user.token) {
        localStorage.setItem("authToken", data.user.token);
      }

      return data;
    } catch (error) {
      setError(error.message || "Registration failed");
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user state regardless of server response
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
