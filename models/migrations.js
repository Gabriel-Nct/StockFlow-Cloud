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

// Fonction pour initialiser la base de données (à appeler au démarrage)
const initializeDatabase = async () => {
  try {
    const tablesCreated = await createTables();
    if (tablesCreated) {
      await seedUsers();
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
