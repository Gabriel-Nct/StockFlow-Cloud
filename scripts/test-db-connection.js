// Script pour tester la connexion à la base de données PostgreSQL
require("dotenv").config();
const { Pool } = require("pg");

const testDatabaseConnection = async () => {
  const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "stockflow",
    password: process.env.DB_PASSWORD || "postgres",
    port: process.env.DB_PORT || 5432,
  });

  try {
    const client = await pool.connect();
    console.log("Connexion à la base de données établie avec succès!");

    // Afficher les informations de la connexion
    console.log("Informations de connexion:");
    console.log(`  - Hôte: ${process.env.DB_HOST || "localhost"}`);
    console.log(`  - Base de données: ${process.env.DB_NAME || "stockflow"}`);
    console.log(`  - Utilisateur: ${process.env.DB_USER || "postgres"}`);
    console.log(`  - Port: ${process.env.DB_PORT || 5432}`);

    // Tester une requête simple
    const result = await client.query("SELECT NOW() as now");
    console.log(`Date et heure du serveur PostgreSQL: ${result.rows[0].now}`);

    // Vérifier l'existence de la base de données
    const dbCheckQuery = `
      SELECT EXISTS (
        SELECT FROM pg_database WHERE datname = $1
      )
    `;
    const dbCheck = await client.query(dbCheckQuery, [
      process.env.DB_NAME || "stockflow",
    ]);
    if (dbCheck.rows[0].exists) {
      console.log(
        `La base de données '${process.env.DB_NAME || "stockflow"}' existe.`
      );
    } else {
      console.log(
        `Attention: La base de données '${
          process.env.DB_NAME || "stockflow"
        }' n'existe pas encore.`
      );
      console.log("Vous devez la créer avant de démarrer l'application.");
      console.log("Commande: CREATE DATABASE stockflow;");
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    console.log("Vérifiez que:");
    console.log("1. PostgreSQL est installé et en cours d'exécution");
    console.log(
      "2. Les informations de connexion dans le fichier .env sont correctes"
    );
    console.log("3. La base de données existe");

    // Instructions pour créer la base de données
    console.log(
      "\nPour créer la base de données, exécutez les commandes suivantes:"
    );
    console.log("  psql -U postgres");
    console.log("  CREATE DATABASE stockflow;");
    console.log("  \\q");
  }
};

// Exécuter le test
testDatabaseConnection();
