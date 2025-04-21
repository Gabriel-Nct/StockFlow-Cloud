import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Vérifier si un token est stocké et qu'il est valide
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Vérifier si le token est expiré
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token expiré
          localStorage.removeItem("token");
          setCurrentUser(null);
        } else {
          // Token valide, récupérer les informations utilisateur
          const userData = JSON.parse(localStorage.getItem("user"));
          setCurrentUser(userData);

          // Configurer axios avec le token pour toutes les requêtes
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError("");
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          username,
          password,
        }
      );

      const { token, user } = response.data;

      // Stocker le token et les informations utilisateur
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Configurer axios avec le token pour toutes les requêtes futures
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setCurrentUser(user);
      return true;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la connexion"
      );
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError("");
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        userData
      );
      return { success: true, data: response.data };
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors de l'inscription"
      );
      return { success: false, error: error.response?.data };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
