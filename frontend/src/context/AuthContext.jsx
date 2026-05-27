import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Setup Axios Authorization Header automatically
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Token Verification check on startup
  useEffect(() => {
    const verifyUserToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("http://localhost/api/v1/auth/verify");
        if (res.data?.valid) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Token auto-verification failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyUserToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost/api/v1/auth/login", { email, password });
      setToken(res.data.access_token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || "Authentication credentials mismatch." 
      };
    }
  };

  const register = async (name, email, password, role = "admin") => {
    try {
      const res = await axios.post("http://localhost/api/v1/auth/register", {
        name,
        email,
        password,
        role
      });
      setToken(res.data.access_token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || "Account registration credentials failed."
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be consumed within an AuthProvider");
  }
  return context;
};
