const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Utiliser bcryptjs, pas bcrypt
const router = express.Router();
const userModel = require("../models/users");
const db = require("../config/database");
const { JWT_SECRET, authenticateJWT } = require("../middlewares/auth");
const { body } = require("express-validator");
const { checkValidation } = require("../middlewares/validators");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Identifiants invalides
 */
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Nom d'utilisateur requis"),
    body("password").notEmpty().withMessage("Mot de passe requis"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Tentative de connexion pour: ${username}`);

      // Récupérer l'utilisateur directement de la DB
      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      const user = result.rows[0];

      if (!user) {
        console.log(`Utilisateur ${username} non trouvé`);
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      console.log(`Utilisateur trouvé: ID=${user.id}, Role=${user.role}`);

      // Vérifier le mot de passe avec bcrypt
      const validPassword = await bcrypt.compare(password, user.password);
      console.log(
        `Validation du mot de passe: ${validPassword ? "Succès" : "Échec"}`
      );

      if (!validPassword) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      // Créer le token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Envoyer le token et les infos utilisateur (sans le mot de passe)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur (public, rôle user uniquement)
 *     tags: [Authentification]
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
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Validation échouée ou utilisateur déjà existant
 */
router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .withMessage("Le nom est requis")
      .isLength({ min: 3 })
      .withMessage("Le nom doit contenir au moins 3 caractères"),
    body("email")
      .notEmpty()
      .withMessage("L'email est requis")
      .isEmail()
      .withMessage("Format d'email invalide"),
    body("username")
      .notEmpty()
      .withMessage("Le nom d'utilisateur est requis")
      .isLength({ min: 3 })
      .withMessage("Le nom d'utilisateur doit contenir au moins 3 caractères"),
    body("password")
      .notEmpty()
      .withMessage("Le mot de passe est requis")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Vérifier si le nom d'utilisateur existe déjà
      const existingUser = userModel.findByUsername(username);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Ce nom d'utilisateur est déjà utilisé" });
      }

      // Vérifier si l'email existe déjà
      const users = userModel.findAll();
      const emailExists = users.some((user) => user.email === email);
      if (emailExists) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Hash du mot de passe avec bcryptjs
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Force le rôle à "user" pour l'inscription publique
      const userData = {
        ...req.body,
        password: hashedPassword,
        role: "user", // Toujours attribuer le rôle "user" lors de l'inscription publique
      };

      // Créer l'utilisateur
      const newUser = await userModel.create(userData);

      res.status(201).json({
        message: "Utilisateur créé avec succès",
        user: newUser,
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtenir les informations de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get("/me", authenticateJWT, (req, res) => {
  const user = userModel.findById(req.user.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "Utilisateur non trouvé" });
  }
});

// Route temporaire pour vérifier la récupération d'un utilisateur
router.get("/check-user/:username", async (req, res) => {
  try {
    const user = await userModel.findByUsername(req.params.username);
    if (user) {
      // Masquer le mot de passe complet pour la sécurité
      const sanitizedUser = {
        ...user,
        password: user.password ? `${user.password.substring(0, 10)}...` : null,
      };
      res.json({ found: true, user: sanitizedUser });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
