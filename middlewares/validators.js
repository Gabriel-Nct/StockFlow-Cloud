const { body, param, validationResult } = require("express-validator");

// Fonction pour vérifier les résultats de validation
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validateur pour la création/mise à jour d'utilisateur
const userValidator = [
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
    .optional()
    .isLength({ min: 3 })
    .withMessage("Le nom d'utilisateur doit contenir au moins 3 caractères"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage('Le rôle doit être "user" ou "admin"'),
  checkValidation,
];

// Validateur pour l'ID de l'utilisateur
const userIdValidator = [
  param("id").isInt().withMessage("L'ID doit être un entier"),
  checkValidation,
];

module.exports = {
  userValidator,
  userIdValidator,
  checkValidation,
};
