const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const userRoutes = require("./routes/users");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const inventoryRoutes = require("./routes/inventory");
const { initializeDatabase } = require("./models/migrations");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialisation de la base de données
(async () => {
  try {
    await initializeDatabase();
    console.log("Base de données initialisée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      error
    );
    process.exit(1); // Quitter l'application en cas d'échec
  }
})();

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Gestion d'Utilisateurs",
      version: "1.0.0",
      description:
        "API REST pour la gestion des utilisateurs avec authentification JWT",
      contact: {
        name: "Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Serveur de développement",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      {
        name: "Authentification",
        description: "Opérations d'authentification (connexion, inscription)",
      },
      {
        name: "Utilisateurs",
        description: "Opérations CRUD sur les utilisateurs",
      },
    ],
  },
  apis: ["./app.js", "./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware pour parser le JSON
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Route de test
 *     description: Retourne un message de bienvenue
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API de gestion d'utilisateurs!" });
});

// Routes pour les utilisateurs
app.use("/api/users", userRoutes);

// Route de test pour les erreurs
app.get("/test-error", (req, res, next) => {
  try {
    // Générer une erreur intentionnellement
    throw new Error("Ceci est une erreur de test");
  } catch (err) {
    next(err); // Passer l'erreur au middleware errorHandler
  }
});

// Middleware pour les routes non trouvées (404)
app.use(notFoundHandler);

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(
    `Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`
  );
});

module.exports = app; // Exporter pour les tests
