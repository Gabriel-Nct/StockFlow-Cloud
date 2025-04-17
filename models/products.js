// models/products.js
const db = require("../config/database");

module.exports = {
  // Récupérer tous les produits
  findAll: async () => {
    try {
      const result = await db.query("SELECT * FROM products ORDER BY name");
      return result.rows;
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      throw error;
    }
  },

  // Récupérer un produit par son ID
  findById: async (id) => {
    try {
      const result = await db.query("SELECT * FROM products WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit #${id}:`, error);
      throw error;
    }
  },

  // Récupérer un produit par son SKU
  findBySku: async (sku) => {
    try {
      const result = await db.query("SELECT * FROM products WHERE sku = $1", [
        sku,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du produit SKU ${sku}:`,
        error
      );
      throw error;
    }
  },

  // Créer un nouveau produit
  create: async (productData) => {
    try {
      const columns = Object.keys(productData).join(", ");
      const placeholders = Object.keys(productData)
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const values = Object.values(productData);

      const query = `
        INSERT INTO products (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      throw error;
    }
  },

  // Mettre à jour un produit
  update: async (id, productData) => {
    try {
      // Construire dynamiquement la requête de mise à jour
      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Ajouter chaque champ fourni à la requête
      for (const [key, value] of Object.entries(productData)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      // Ajouter la mise à jour de updated_at
      fields.push(`updated_at = CURRENT_TIMESTAMP`);

      // Ajouter l'ID à la fin des paramètres
      values.push(id);

      const query = `
        UPDATE products 
        SET ${fields.join(", ")} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du produit #${id}:`, error);
      throw error;
    }
  },

  // Supprimer un produit
  delete: async (id) => {
    try {
      // Vérifier d'abord s'il existe des mouvements de stock liés à ce produit
      const movementsCheck = await db.query(
        "SELECT COUNT(*) FROM inventory_movements WHERE product_id = $1",
        [id]
      );

      if (parseInt(movementsCheck.rows[0].count) > 0) {
        throw new Error(
          "Impossible de supprimer ce produit car il a des mouvements de stock associés"
        );
      }

      // Si pas de mouvements associés, supprimer le produit
      const result = await db.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error(`Erreur lors de la suppression du produit #${id}:`, error);
      throw error;
    }
  },

  // Rechercher des produits avec filtres et pagination
  findWithFilters: async (filters = {}, pagination = {}) => {
    try {
      const { name, category, sku, minStock } = filters;
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

      if (category) {
        whereConditions.push(`category ILIKE $${paramIndex}`);
        params.push(`%${category}%`);
        paramIndex++;
      }

      if (sku) {
        whereConditions.push(`sku ILIKE $${paramIndex}`);
        params.push(`%${sku}%`);
        paramIndex++;
      }

      if (minStock === true) {
        whereConditions.push(`quantity <= min_stock_level`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Compter le nombre total de résultats
      const countQuery = `
        SELECT COUNT(*) FROM products ${whereClause}
      `;

      const countResult = await db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Récupérer les données avec pagination
      const dataParams = [...params, limit, offset];
      const dataQuery = `
        SELECT * 
        FROM products 
        ${whereClause}
        ORDER BY name 
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
      console.error("Erreur lors de la recherche des produits:", error);
      throw error;
    }
  },

  // Mettre à jour la quantité d'un produit (suite à un mouvement de stock)
  updateQuantity: async (id, quantity, type) => {
    try {
      // type peut être 'add' ou 'subtract'
      const operator = type === "add" ? "+" : "-";

      const query = `
        UPDATE products
        SET quantity = quantity ${operator} $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await db.query(query, [Math.abs(quantity), id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de la quantité du produit #${id}:`,
        error
      );
      throw error;
    }
  },
};
