const db = require("../config/database");
const bcrypt = require("bcryptjs");

// Création des tables de la base de données
const createTables = async () => {
  try {
    // Table des utilisateurs
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des produits
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        cost_price DECIMAL(10,2),
        quantity INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        location VARCHAR(100),
        image_url VARCHAR(255),
        barcode VARCHAR(100) UNIQUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des mouvements de stock
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'in' or 'out'
        reason VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return', etc.
        reference VARCHAR(100), -- numéro de commande, facture, etc.
        notes TEXT,
        performed_by INTEGER REFERENCES users(id),
        performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Tables créées avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la création des tables:", error);
    return false;
  }
};

// Insertion des utilisateurs par défaut pour les tests
const seedUsers = async () => {
  try {
    // Vérifier si des utilisateurs existent déjà
    const result = await db.query("SELECT COUNT(*) FROM users");
    if (parseInt(result.rows[0].count) > 0) {
      console.log("Des utilisateurs existent déjà, le seeding est ignoré");
      return true;
    }

    // Hacher les mots de passe
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash("password123", saltRounds);
    const userPassword = await bcrypt.hash("password123", saltRounds);

    // Insérer les utilisateurs de test
    await db.query(
      `
      INSERT INTO users (name, email, username, password, role) VALUES
      ('John Doe', 'john@example.com', 'admin', $1, 'admin'),
      ('Jane Smith', 'jane@example.com', 'user', $2, 'user')
    `,
      [adminPassword, userPassword]
    );

    console.log("Utilisateurs par défaut créés avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors du seeding des utilisateurs:", error);
    return false;
  }
};

// Fonction pour insérer des produits de test
const seedProducts = async () => {
  try {
    // Vérifier si des produits existent déjà
    const result = await db.query("SELECT COUNT(*) FROM products");
    if (parseInt(result.rows[0].count) > 0) {
      console.log("Des produits existent déjà, le seeding est ignoré");
      return true;
    }

    // Insérer des produits de test
    await db.query(`
      INSERT INTO products (sku, name, description, category, price, cost_price, quantity, min_stock_level, location) VALUES
      ('LAP-DEL-001', 'Ordinateur portable Dell XPS 13', 'Ordinateur portable haut de gamme avec écran 13"', 'Informatique', 1299.99, 950.00, 15, 5, 'Rayon A-12'),
      ('MON-LG-001', 'Moniteur LG 27"', 'Moniteur 4K 27 pouces', 'Périphériques', 349.99, 250.00, 25, 8, 'Rayon B-05'),
      ('MOUSE-LOG-001', 'Souris Logitech MX Master', 'Souris sans fil ergonomique', 'Périphériques', 89.99, 45.00, 40, 10, 'Rayon B-08'),
      ('KEY-COR-001', 'Clavier Corsair K70', 'Clavier mécanique gaming RGB', 'Périphériques', 129.99, 75.00, 20, 7, 'Rayon B-10'),
      ('HD-SEA-001', 'Disque dur Seagate 2TB', 'Disque dur externe 2TB USB 3.0', 'Stockage', 79.99, 40.00, 30, 10, 'Rayon C-02')
    `);

    console.log("Produits de test créés avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors du seeding des produits:", error);
    return false;
  }
};

// Fonction pour initialiser la base de données (à appeler au démarrage)
const initializeDatabase = async () => {
  try {
    const tablesCreated = await createTables();
    if (tablesCreated) {
      await seedUsers();
      await seedProducts();
    }
    return true;
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      error
    );
    return false;
  }
};

module.exports = {
  initializeDatabase,
};
