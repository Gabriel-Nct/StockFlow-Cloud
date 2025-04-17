// models/inventory_movements.js
const db = require("../config/database");
const productModel = require("./products");

module.exports = {
  // Récupérer tous les mouvements
  findAll: async () => {
    try {
      const result = await db.query(`
        SELECT im.*, p.name as product_name, p.sku as product_sku, u.name as user_name
        FROM inventory_movements im
        LEFT JOIN products p ON im.product_id = p.id
        LEFT JOIN users u ON im.performed_by = u.id
        ORDER BY im.performed_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des mouvements de stock:",
        error
      );
      throw error;
    }
  },

  // Récupérer un mouvement par son ID
  findById: async (id) => {
    try {
      const result = await db.query(
        `
        SELECT im.*, p.name as product_name, p.sku as product_sku, u.name as user_name
        FROM inventory_movements im
        LEFT JOIN products p ON im.product_id = p.id
        LEFT JOIN users u ON im.performed_by = u.id
        WHERE im.id = $1
      `,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du mouvement #${id}:`,
        error
      );
      throw error;
    }
  },

  // Récupérer les mouvements pour un produit
  findByProductId: async (productId) => {
    try {
      const result = await db.query(
        `
        SELECT im.*, p.name as product_name, p.sku as product_sku, u.name as user_name
        FROM inventory_movements im
        LEFT JOIN products p ON im.product_id = p.id
        LEFT JOIN users u ON im.performed_by = u.id
        WHERE im.product_id = $1
        ORDER BY im.performed_at DESC
      `,
        [productId]
      );
      return result.rows;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des mouvements pour le produit #${productId}:`,
        error
      );
      throw error;
    }
  },

  // Enregistrer un mouvement de stock et mettre à jour la quantité du produit
  create: async (movementData) => {
    // Commencer une transaction
    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      // Insérer le mouvement
      const columns = Object.keys(movementData).join(", ");
      const placeholders = Object.keys(movementData)
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const values = Object.values(movementData);

      const query = `
        INSERT INTO inventory_movements (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await client.query(query, values);
      const newMovement = result.rows[0];

      // Mettre à jour la quantité du produit
      const updateType = movementData.type === "in" ? "add" : "subtract";

      const productQuery = `
        UPDATE products
        SET quantity = quantity ${updateType === "add" ? "+" : "-"} $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      await client.query(productQuery, [
        Math.abs(movementData.quantity),
        movementData.product_id,
      ]);

      // Valider la transaction
      await client.query("COMMIT");

      return newMovement;
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await client.query("ROLLBACK");
      console.error("Erreur lors de la création du mouvement de stock:", error);
      throw error;
    } finally {
      // Libérer le client
      client.release();
    }
  },

  // Rechercher des mouvements avec filtres et pagination
  findWithFilters: async (filters = {}, pagination = {}) => {
    try {
      const { product_id, type, reason, reference, fromDate, toDate } = filters;
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const offset = (page - 1) * limit;

      // Construire la clause WHERE
      const whereConditions = [];
      const params = [];
      let paramIndex = 1;

      if (product_id) {
        whereConditions.push(`im.product_id = $${paramIndex}`);
        params.push(product_id);
        paramIndex++;
      }

      if (type) {
        whereConditions.push(`im.type = $${paramIndex}`);
        params.push(type);
        paramIndex++;
      }

      if (reason) {
        whereConditions.push(`im.reason = $${paramIndex}`);
        params.push(reason);
        paramIndex++;
      }

      if (reference) {
        whereConditions.push(`im.reference ILIKE $${paramIndex}`);
        params.push(`%${reference}%`);
        paramIndex++;
      }

      if (fromDate) {
        whereConditions.push(`im.performed_at >= $${paramIndex}`);
        params.push(fromDate);
        paramIndex++;
      }

      if (toDate) {
        whereConditions.push(`im.performed_at <= $${paramIndex}`);
        params.push(toDate);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Compter le nombre total de résultats
      const countQuery = `
        SELECT COUNT(*) 
        FROM inventory_movements im
        ${whereClause}
      `;

      const countResult = await db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Récupérer les données avec pagination
      const dataParams = [...params, limit, offset];
      const dataQuery = `
        SELECT im.*, p.name as product_name, p.sku as product_sku, u.name as user_name
        FROM inventory_movements im
        LEFT JOIN products p ON im.product_id = p.id
        LEFT JOIN users u ON im.performed_by = u.id
        ${whereClause}
        ORDER BY im.performed_at DESC
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
      console.error(
        "Erreur lors de la recherche des mouvements de stock:",
        error
      );
      throw error;
    }
  },
};
