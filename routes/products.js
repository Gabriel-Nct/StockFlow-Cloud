// routes/products.js
const express = require("express");
const router = express.Router();
const productModel = require("../models/products");
const { body, param, query } = require("express-validator");
const { checkValidation } = require("../middlewares/validators");
const { authenticateJWT, authorizeRole } = require("../middlewares/auth");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer tous les produits avec filtres optionnels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrer par nom (recherche partielle)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie (recherche partielle)
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *         description: Filtrer par SKU (recherche partielle)
 *       - in: query
 *         name: minStock
 *         schema:
 *           type: boolean
 *         description: Si true, retourne uniquement les produits dont la quantité est inférieure ou égale au stock minimal
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
 *         description: Liste des produits
 *       401:
 *         description: Non authentifié
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { name, category, sku, minStock, page, limit } = req.query;

    const result = await productModel.findWithFilters(
      { name, category, sku, minStock: minStock === "true" },
      { page, limit }
    );

    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Récupérer un produit par son ID
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
 *         description: Détails du produit
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Produit non trouvé
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
      const product = await productModel.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      res.json(product);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du produit #${req.params.id}:`,
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Créer un nouveau produit
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - price
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               cost_price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               min_stock_level:
 *                 type: integer
 *               location:
 *                 type: string
 *               image_url:
 *                 type: string
 *               barcode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produit créé
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
  [
    body("sku")
      .notEmpty()
      .withMessage("Le SKU est requis")
      .isLength({ min: 3, max: 50 })
      .withMessage("Le SKU doit contenir entre 3 et 50 caractères"),
    body("name")
      .notEmpty()
      .withMessage("Le nom est requis")
      .isLength({ min: 2, max: 255 })
      .withMessage("Le nom doit contenir entre 2 et 255 caractères"),
    body("price")
      .notEmpty()
      .withMessage("Le prix est requis")
      .isFloat({ min: 0 })
      .withMessage("Le prix doit être un nombre positif"),
    body("cost_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Le prix d'achat doit être un nombre positif"),
    body("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("La quantité doit être un entier positif"),
    body("min_stock_level")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Le niveau de stock minimal doit être un entier positif"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      // Vérifier si le SKU existe déjà
      const existingProduct = await productModel.findBySku(req.body.sku);
      if (existingProduct) {
        return res.status(400).json({ message: "Ce SKU est déjà utilisé" });
      }

      // Ajouter l'ID de l'utilisateur qui crée le produit
      const productData = {
        ...req.body,
        created_by: req.user.id,
      };

      const newProduct = await productModel.create(productData);

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Mettre à jour un produit
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
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               cost_price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               min_stock_level:
 *                 type: integer
 *               location:
 *                 type: string
 *               image_url:
 *                 type: string
 *               barcode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produit mis à jour
 *       400:
 *         description: Validation échouée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
 */
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin"]),
  [
    param("id").isInt().withMessage("L'ID doit être un entier"),
    body("sku")
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage("Le SKU doit contenir entre 3 et 50 caractères"),
    body("name")
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage("Le nom doit contenir entre 2 et 255 caractères"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Le prix doit être un nombre positif"),
    body("cost_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Le prix d'achat doit être un nombre positif"),
    body("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("La quantité doit être un entier positif"),
    body("min_stock_level")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Le niveau de stock minimal doit être un entier positif"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      // Vérifier si le produit existe
      const product = await productModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Si le SKU est modifié, vérifier qu'il n'existe pas déjà
      if (req.body.sku && req.body.sku !== product.sku) {
        const existingProduct = await productModel.findBySku(req.body.sku);
        if (existingProduct && existingProduct.id !== parseInt(req.params.id)) {
          return res
            .status(400)
            .json({ message: "Ce SKU est déjà utilisé par un autre produit" });
        }
      }

      const updatedProduct = await productModel.update(req.params.id, req.body);

      res.json(updatedProduct);
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du produit #${req.params.id}:`,
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer un produit
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
 *         description: Produit supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
 *       409:
 *         description: Impossible de supprimer (produit utilisé dans des mouvements)
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin"]),
  [
    param("id").isInt().withMessage("L'ID doit être un entier"),
    checkValidation,
  ],
  async (req, res) => {
    try {
      // Vérifier si le produit existe
      const product = await productModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      const deletedProduct = await productModel.delete(req.params.id);

      res.json({
        message: "Produit supprimé avec succès",
        product: deletedProduct,
      });
    } catch (error) {
      if (error.message.includes("Impossible de supprimer")) {
        return res.status(409).json({ message: error.message });
      }

      console.error(
        `Erreur lors de la suppression du produit #${req.params.id}:`,
        error
      );
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

/**
 * @swagger
 * /api/products/sku/{sku}:
 *   get:
 *     summary: Récupérer un produit par son SKU
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du produit
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Produit non trouvé
 */
router.get("/sku/:sku", authenticateJWT, async (req, res) => {
  try {
    const product = await productModel.findBySku(req.params.sku);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(product);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du produit SKU ${req.params.sku}:`,
      error
    );
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

module.exports = router;
