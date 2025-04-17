// Configuration de la connexion à PostgreSQL
const { Pool } = require("pg");
require("dotenv").config();

// Création du pool de connexions PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "stockflow",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

// Test de connexion à la base de données
pool.connect((err, client, release) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err.stack);
  } else {
    console.log(
      "Connexion à la base de données PostgreSQL établie avec succès"
    );
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
