import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Rendre le composant enfant si l'utilisateur est authentifié
  return children;
};

export default ProtectedRoute;
