# StockFlow - Gestion de Stock Cloud

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org/)

**StockFlow** est une solution complète de gestion de stock en temps réel, comprenant une API RESTful et une interface web moderne.

## 📌 Table des matières

- [StockFlow - Gestion de Stock Cloud](#stockflow---gestion-de-stock-cloud)
  - [📌 Table des matières](#-table-des-matières)
  - [🚀 Fonctionnalités](#-fonctionnalités)
  - [💻 Technologies](#-technologies)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [📥 Installation](#-installation)
  - [📚 Documentation](#-documentation)
  - [📊 Diagrammes](#-diagrammes)
    - [Architecture technique](#architecture-technique)
    - [Modèle de données](#modèle-de-données)
    - [Workflow API](#workflow-api)
  - [👥 Contributeurs](#-contributeurs)
  - [📜 License](#-license)

## 🚀 Fonctionnalités

- **Gestion des produits** (CRUD complet)
- **Suivi des mouvements de stock** (entrées/sorties)
- **Alertes de seuil minimum**
- **Tableau de bord interactif**
- **Authentification sécurisée** (JWT)
- **API documentée** (Swagger/OpenAPI)

## 💻 Technologies

### Backend

- Node.js 18+
- Express.js
- PostgreSQL
- JWT (Authentification)

### Frontend

- React 18+
- Redux Toolkit
- Tailwind CSS
- Axios

## 📥 Installation

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/votre-repo/stockflow.git
   cd stockflow
   ```

   **Backend** :

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configurer les variables d'environnement
   npm start
   ```

- **Frontend** :

  ```bash
  cd frontend
  npm install
  npm run dev
  ```

## 📚 Documentation

- **Cahier des charges** - [Documentation du projet](documentation.pdf)
- **[API Documentation](http://localhost:3000/api-docs)** (Disponible après démarrage du backend)

## 📊 Diagrammes

### Architecture technique

[![Diagramme d'architecture](https://www.mermaidchart.com/raw/74542cf4-14a5-4a33-9ab0-bec1a68a8bbd?theme=light&version=v0.1&format=svg)](https://www.mermaidchart.com/raw/74542cf4-14a5-4a33-9ab0-bec1a68a8bbd)

### Modèle de données

[![Diagramme de classes](https://www.mermaidchart.com/raw/8326717b-dc06-4788-a467-446034061db2?theme=light&version=v0.1&format=svg)](https://www.mermaidchart.com/raw/8326717b-dc06-4788-a467-446034061db2)

### Workflow API

[![Diagramme de séquence](https://www.mermaidchart.com/raw/ab1af2d1-07d0-49f7-ab31-f4a18ad1723b?theme=light&version=v0.1&format=svg)](https://www.mermaidchart.com/raw/ab1af2d1-07d0-49f7-ab31-f4a18ad1723b)

## 👥 Contributeurs

- Gabriel B ([@Gabriel-Nct](https://github.com/Gabriel-Nct))
- Brahim H ([@Bramsovic](https://github.com/Bramsovic))

## 📜 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](https://LICENSE) pour plus de détails.

**Note** : Ce projet est actuellement en phase de développement actif. Consultez régulièrement les mises à jour !

Vous pouvez adapter :

- Les liens GitHub des contributeurs
- Le port par défaut de l'API
