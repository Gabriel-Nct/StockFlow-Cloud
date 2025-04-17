// routes/inventory.js
const express = require("express");
const router = express.Router();
const inventoryModel = require("../models/inventory_movements");
const productModel = require("../models/products");
const { body, param, query } = require("express-validator");
const { checkValidation } = require("../middlewares/validators");
const { authenticateJWT, authorizeRole } = require("../middlewares/auth");

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Récupérer tous les mouvements de stock avec filtres optionnels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID de produit
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [in, out]
 *         description: Filtrer par type de mouvement
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *         description: Filtrer par raison
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         description: Filtrer par référence
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (format YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (format YYYY-MM-DD)
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
 *         description: Liste des mouvements de stock
 *       401:
 *         description: Non authentifié
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const {
      product_id,
      type,
      reason,
      reference,
      fromDate,
      toDate,
      page,
      limit,
    } = req.query;

    const result = await inventoryModel.findWithFilters(
      {
        product_id: product_id ? parseInt(product_id) : undefined,
        type,
        reason,
        reference,
        fromDate,
        toDate,
      },
      { page, limit }
    );

    res.json(result);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des mouvements de stock:",
      error
    );
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Récupérer un mouvement de stock par son ID
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
 *         description: Détails du mouvement
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Mouvement non trouvé
 */
router.get(
  "/:id",
  authenticateJWT,
  [
    param("id").isInt().withMessage("L'ID doit être un entier"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      const movement = await inventoryModel.findById(req.params.id);

      if (!movement) {
        return res.status(404).json({ message: "Mouvement non trouvé" });
      }

      res.json(movement);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du mouvement #${req.params.id}:`,
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/inventory/product/{productId}:
 *   get:
 *     summary: Récupérer les mouvements de stock pour un produit spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des mouvements pour le produit
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Produit non trouvé
 */
router.get(
  "/product/:productId",
  authenticateJWT,
  [
    param("productId")
      .isInt()
      .withMessage("L'ID du produit doit être un entier"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      // Vérifier si le produit existe
      const product = await productModel.findById(req.params.productId);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      const movements = await inventoryModel.findByProductId(
        req.params.productId
      );

      res.json(movements);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des mouvements pour le produit #${req.params.productId}:`,
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Créer un nouveau mouvement de stock
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - type
 *               - reason
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [in, out]
 *               reason:
 *                 type: string
 *                 enum: [purchase, sale, adjustment, return, damaged, other]
 *               reference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mouvement créé
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
 *       422:
 *         description: Stock insuffisant pour une sortie
 */
router.post(
  "/",
  authenticateJWT,
  [
    body("product_id")
      .notEmpty()
      .withMessage("L'ID du produit est requis")
      .isInt()
      .withMessage("L'ID du produit doit être un entier"),
    body("quantity")
      .notEmpty()
      .withMessage("La quantité est requise")
      .isInt({ min: 1 })
      .withMessage("La quantité doit être un entier positif"),
    body("type")
      .notEmpty()
      .withMessage("Le type est requis")
      .isIn(["in", "out"])
      .withMessage("Le type doit être 'in' ou 'out'"),
    body("reason")
      .notEmpty()
      .withMessage("La raison est requise")
      .isIn(["purchase", "sale", "adjustment", "return", "damaged", "other"])
      .withMessage("Raison invalide"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      // Vérifier si le produit existe
      const product = await productModel.findById(req.body.product_id);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Vérifier s'il y a assez de stock pour une sortie
      if (req.body.type === "out" && product.quantity < req.body.quantity) {
        return res.status(422).json({
          message: "Stock insuffisant",
          available: product.quantity,
          requested: req.body.quantity,
        });
      }

      // Créer le mouvement de stock avec l'ID de l'utilisateur
      const movementData = {
        ...req.body,
        performed_by: req.user.id,
      };

      const newMovement = await inventoryModel.create(movementData);

      res.status(201).json(newMovement);
    } catch (error) {
      console.error("Erreur lors de la création du mouvement de stock:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/inventory/stock-in:
 *   post:
 *     summary: Enregistrer une entrée de stock
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - reason
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 enum: [purchase, return, adjustment, other]
 *               reference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entrée de stock enregistrée
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Produit non trouvé
 */
router.post(
  "/stock-in",
  authenticateJWT,
  [
    body("product_id")
      .notEmpty()
      .withMessage("L'ID du produit est requis")
      .isInt()
      .withMessage("L'ID du produit doit être un entier"),
    body("quantity")
      .notEmpty()
      .withMessage("La quantité est requise")
      .isInt({ min: 1 })
      .withMessage("La quantité doit être un entier positif"),
    body("reason")
      .notEmpty()
      .withMessage("La raison est requise")
      .isIn(["purchase", "return", "adjustment", "other"])
      .withMessage("Raison invalide"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      // Vérifier si le produit existe
      const product = await productModel.findById(req.body.product_id);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Créer le mouvement de stock (entrée)
      const movementData = {
        ...req.body,
        type: "in",
        performed_by: req.user.id,
      };

      const newMovement = await inventoryModel.create(movementData);

      res.status(201).json({
        message: "Entrée de stock enregistrée avec succès",
        movement: newMovement,
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'entrée de stock:",
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/inventory/stock-out:
 *   post:
 *     summary: Enregistrer une sortie de stock
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - reason
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 enum: [sale, damaged, adjustment, other]
 *               reference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sortie de stock enregistrée
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Produit non trouvé
 *       422:
 *         description: Stock insuffisant
 */
router.post(
  "/stock-out",
  authenticateJWT,
  [
    body("product_id")
      .notEmpty()
      .withMessage("L'ID du produit est requis")
      .isInt()
      .withMessage("L'ID du produit doit être un entier"),
    body("quantity")
      .notEmpty()
      .withMessage("La quantité est requise")
      .isInt({ min: 1 })
      .withMessage("La quantité doit être un entier positif"),
    body("reason")
      .notEmpty()
      .withMessage("La raison est requise")
      .isIn(["sale", "damaged", "adjustment", "other"])
      .withMessage("Raison invalide"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      // Vérifier si le produit existe
      const product = await productModel.findById(req.body.product_id);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Vérifier s'il y a assez de stock
      if (product.quantity < req.body.quantity) {
        return res.status(422).json({
          message: "Stock insuffisant",
          available: product.quantity,
          requested: req.body.quantity,
        });
      }

      // Créer le mouvement de stock (sortie)
      const movementData = {
        ...req.body,
        type: "out",
        performed_by: req.user.id,
      };

      const newMovement = await inventoryModel.create(movementData);

      res.status(201).json({
        message: "Sortie de stock enregistrée avec succès",
        movement: newMovement,
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de la sortie de stock:",
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

module.exports = router;
