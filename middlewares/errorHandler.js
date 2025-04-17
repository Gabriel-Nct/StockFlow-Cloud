// Gestionnaire d'erreurs centralisé
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // En fonction du type d'erreur, on peut personnaliser la réponse
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  // Erreur par défaut
  res.status(500).json({
    error: "Une erreur est survenue sur le serveur",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

// Gestionnaire pour les routes non trouvées
const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} non trouvée` });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
