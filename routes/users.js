const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Utiliser bcryptjs, pas bcrypt
const userModel = require("../models/users");
const { userValidator, userIdValidator } = require("../middlewares/validators");
const { authenticateJWT, authorizeRole } = require("../middlewares/auth");

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrer par nom (recherche partielle)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrer par email (recherche partielle)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.get("/", authenticateJWT, authorizeRole(["admin"]), (req, res) => {
  const { name, email, page, limit } = req.query;

  const result = userModel.findWithFilters(
    { name, email }, // filtres
    { page, limit } // pagination
  );

  res.json(result);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get("/:id", authenticateJWT, userIdValidator, (req, res) => {
  // Permettre à un utilisateur de voir son propre profil, mais seulement l'admin peut voir tous les profils
  if (req.user.role !== "admin" && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: "Accès non autorisé" });
  }

  const user = userModel.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "Utilisateur non trouvé" });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur (admin seulement)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.post(
  "/",
  authenticateJWT,
  authorizeRole(["admin"]),
  userValidator,
  async (req, res) => {
    try {
      // Vérifier si le nom d'utilisateur existe déjà
      if (req.body.username) {
        const existingUser = userModel.findByUsername(req.body.username);
        if (existingUser) {
          return res.status(400).json({
            message: "Ce nom d'utilisateur est déjà utilisé",
          });
        }
      }

      // Vérifier si l'email existe déjà (optionnel mais recommandé)
      if (req.body.email) {
        const users = userModel.findAll();
        const emailExists = users.some((user) => user.email === req.body.email);
        if (emailExists) {
          return res.status(400).json({
            message: "Cet email est déjà utilisé",
          });
        }
      }

      // Hash du mot de passe
      if (req.body.password) {
        const saltRounds = 10;
        req.body.password = await bcrypt.hash(req.body.password, saltRounds);
      }

      const newUser = await userModel.create(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put(
  "/:id",
  authenticateJWT,
  userIdValidator,
  userValidator,
  async (req, res) => {
    try {
      // Seul un admin peut modifier le rôle d'un utilisateur
      if (req.body.role && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier le rôle",
        });
      }

      // Un utilisateur ne peut modifier que son propre profil, sauf s'il est admin
      if (
        req.user.role !== "admin" &&
        req.user.id !== parseInt(req.params.id)
      ) {
        return res.status(403).json({
          message: "Vous n'êtes autorisé à modifier que votre propre profil",
        });
      }

      // Vérifier si le nom d'utilisateur existe déjà (si changé)
      if (req.body.username) {
        const existingUser = userModel.findByUsername(req.body.username);
        if (existingUser && existingUser.id !== parseInt(req.params.id)) {
          return res.status(400).json({
            message: "Ce nom d'utilisateur est déjà utilisé",
          });
        }
      }

      // Vérifier si l'email existe déjà (si changé)
      if (req.body.email) {
        const users = userModel.findAll();
        const emailExists = users.some(
          (user) =>
            user.email === req.body.email && user.id !== parseInt(req.params.id)
        );
        if (emailExists) {
          return res.status(400).json({
            message: "Cet email est déjà utilisé",
          });
        }
      }

      // Hash du mot de passe si fourni
      if (req.body.password) {
        const saltRounds = 10;
        req.body.password = await bcrypt.hash(req.body.password, saltRounds);
      }

      const updatedUser = await userModel.update(req.params.id, req.body);
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin"]),
  userIdValidator,
  (req, res) => {
    try {
      const deletedUser = userModel.delete(req.params.id);
      if (deletedUser) {
        res.json({ message: "Utilisateur supprimé", user: deletedUser });
      } else {
        res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

module.exports = router;
