const bcrypt = require("bcryptjs");
const db = require("../config/database");

// Simulation d'une base de données avec un tableau
// Utilisation de mots de passe en clair pour simplifier le débogage
let users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    username: "admin",
    password: "password123", // Mot de passe en clair
    role: "admin",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    username: "user",
    password: "password123", // Mot de passe en clair
    role: "user",
  },
];

module.exports = {
  // Récupérer tous les utilisateurs (sans leur mot de passe)
  findAll: async () => {
    try {
      const result = await db.query(
        "SELECT id, name, email, username, role, created_at, updated_at FROM users"
      );
      return result.rows;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  },

  // Récupérer un utilisateur par son ID (sans son mot de passe)
  findById: async (id) => {
    try {
      const result = await db.query(
        "SELECT id, name, email, username, role, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'utilisateur #${id}:`,
        error
      );
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  create: async (userData) => {
    try {
      const { name, email, username, password, role = "user" } = userData;

      const result = await db.query(
        `INSERT INTO users (name, email, username, password, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, username, role, created_at, updated_at`,
        [name, email, username, password, role]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  update: async (id, userData) => {
    try {
      // Construire dynamiquement la requête de mise à jour
      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Ajouter chaque champ fourni à la requête
      for (const [key, value] of Object.entries(userData)) {
        if (["name", "email", "username", "password", "role"].includes(key)) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      // Ajouter la mise à jour de updated_at
      fields.push(`updated_at = CURRENT_TIMESTAMP`);

      // Ajouter l'ID à la fin des paramètres
      values.push(id);

      // Si aucun champ à mettre à jour, retourner l'utilisateur existant
      if (fields.length === 1) {
        // Seulement updated_at
        const existingUser = await this.findById(id);
        return existingUser;
      }

      const query = `
        UPDATE users 
        SET ${fields.join(", ")} 
        WHERE id = $${paramIndex} 
        RETURNING id, name, email, username, role, created_at, updated_at
      `;

      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'utilisateur #${id}:`,
        error
      );
      throw error;
    }
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    try {
      // D'abord récupérer les informations de l'utilisateur avant suppression
      const user = await this.findById(id);
      if (!user) return null;

      // Ensuite supprimer l'utilisateur
      await db.query("DELETE FROM users WHERE id = $1", [id]);

      return user;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'utilisateur #${id}:`,
        error
      );
      throw error;
    }
  },

  // Rechercher des utilisateurs avec filtres et pagination
  findWithFilters: async (filters = {}, pagination = {}) => {
    try {
      const { name, email } = filters;
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const offset = (page - 1) * limit;

      // Construire la clause WHERE
      const whereConditions = [];
      const params = [];
      let paramIndex = 1;

      if (name) {
        whereConditions.push(`name ILIKE $${paramIndex}`);
        params.push(`%${name}%`);
        paramIndex++;
      }

      if (email) {
        whereConditions.push(`email ILIKE $${paramIndex}`);
        params.push(`%${email}%`);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Compter le nombre total de résultats
      const countQuery = `
        SELECT COUNT(*) FROM users ${whereClause}
      `;

      const countResult = await db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Récupérer les données avec pagination
      const dataParams = [...params, limit, offset];
      const dataQuery = `
        SELECT id, name, email, username, role, created_at, updated_at 
        FROM users 
        ${whereClause}
        ORDER BY id 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const dataResult = await db.query(dataQuery, dataParams);

      return {
        data: dataResult.rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Erreur lors de la recherche des utilisateurs:", error);
      throw error;
    }
  },

  // Trouver un utilisateur par son nom d'utilisateur (avec mot de passe)
  findByUsername: async (username) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(
        `Erreur lors de la recherche de l'utilisateur "${username}":`,
        error
      );
      throw error;
    }
  },

  // Valider un mot de passe
  validatePassword: async (plainPassword, hashedPassword) => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Erreur lors de la validation du mot de passe:", error);
      return false;
    }
  },
};
