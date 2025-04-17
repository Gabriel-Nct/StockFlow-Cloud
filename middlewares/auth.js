const jwt = require("jsonwebtoken");
const userModel = require("../models/users");
require("dotenv").config();

// Clé secrète pour signer les tokens JWT - dans un environnement réel, utilisez une variable d'environnement
const JWT_SECRET = process.env.JWT_SECRET || "votre_clé_secrète";
// Durée de validité du token JWT - dans un environnement réel, utilisez une variable d'environnement
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h";

// Middleware pour vérifier le token JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token invalide ou expiré" });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Token d'authentification requis" });
  }
};

// Middleware pour vérifier les rôles
const authorizeRole = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Accès refusé: vous n'avez pas les permissions nécessaires",
      });
    }

    next();
  };
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRATION,
  authenticateJWT,
  authorizeRole,
};
