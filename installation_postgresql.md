# Guide d'installation et de configuration de PostgreSQL

Ce guide vous aidera à installer et configurer PostgreSQL pour votre application StockFlow Cloud.

## 1. Installation de PostgreSQL

### Sur Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Sur Windows

1. Téléchargez l'installateur depuis [le site officiel de PostgreSQL](https://www.postgresql.org/download/windows/)
2. Suivez les instructions d'installation
3. Notez le mot de passe que vous définissez pour l'utilisateur 'postgres'

### Sur macOS

```bash
brew install postgresql
brew services start postgresql
```

## 2. Création de la base de données

Une fois PostgreSQL installé, vous devez créer une base de données pour votre application:

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE stockflow;

# Optionnel: Créer un utilisateur dédié
CREATE USER stockflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stockflow TO stockflow_user;

# Quitter psql
\q
```

## 3. Configuration de l'application

1. Copiez le fichier `.env.example` en `.env`:

   ```bash
   cp .env.example .env
   ```

2. Modifiez le fichier `.env` avec vos paramètres de connexion:

   ```
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=stockflow
   DB_PORT=5432
   ```

3. Installez les dépendances:

   ```bash
   npm install
   ```

4. Testez la connexion à la base de données:

   ```bash
   npm run test-db
   ```

5. Initialisez la base de données:
   ```bash
   npm run init-db
   ```

## 4. Démarrage de l'application

Une fois la configuration terminée, vous pouvez démarrer l'application:

```bash
# Pour le développement (avec redémarrage automatique)
npm run dev

# Pour la production
npm start
```

L'API sera disponible à l'adresse http://localhost:3000 (ou au port configuré dans votre fichier .env).
La documentation Swagger sera accessible à http://localhost:3000/api-docs.

## 5. Résolution des problèmes courants

### Erreur de connexion à la base de données

- Vérifiez que PostgreSQL est bien installé et en cours d'exécution
- Vérifiez les paramètres de connexion dans le fichier `.env`
- Assurez-vous que la base de données a été créée

### Problèmes de droits d'accès

- Si vous utilisez Linux, assurez-vous que votre utilisateur a les droits nécessaires
- Sur certaines installations, vous devrez configurer pg_hba.conf pour autoriser les connexions

### Erreurs d'initialisation

- Exécutez `npm run init-db` pour créer les tables et les données initiales
- Consultez les journaux pour identifier les erreurs spécifiques

## 6. Notes pour la production

En production, assurez-vous de:

1. Utiliser un mot de passe fort pour la base de données
2. Configurer un secret JWT fort et unique
3. Mettre en place des sauvegardes régulières de la base de données
4. Utiliser HTTPS pour sécuriser les communications
