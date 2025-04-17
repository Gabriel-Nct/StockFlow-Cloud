const bcrypt = require("bcryptjs"); // Utiliser bcryptjs, pas bcrypt

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
  findAll: () => users.map(({ password, ...user }) => user), // Ne jamais renvoyer les mots de passe

  findById: (id) => {
    const user = users.find((user) => user.id === parseInt(id));
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  create: async (userData) => {
    const newId =
      users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    // Le hashage est maintenant géré dans la route auth.js
    // pour éviter les problèmes de dépendance

    const newUser = {
      id: newId,
      ...userData,
      role: userData.role || "user", // Par défaut, le rôle est 'user'
    };

    users.push(newUser);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  update: async (id, userData) => {
    const index = users.findIndex((user) => user.id === parseInt(id));
    if (index !== -1) {
      // Le hashage est maintenant géré dans les routes
      // pour éviter les problèmes de dépendance

      users[index] = { ...users[index], ...userData };

      // Retourner l'utilisateur sans le mot de passe
      const { password, ...userWithoutPassword } = users[index];
      return userWithoutPassword;
    }
    return null;
  },

  delete: (id) => {
    const index = users.findIndex((user) => user.id === parseInt(id));
    if (index !== -1) {
      const { password, ...deletedUser } = users[index];
      users = users.filter((user) => user.id !== parseInt(id));
      return deletedUser;
    }
    return null;
  },

  findWithFilters: (filters = {}, pagination = {}) => {
    let result = [...users];

    // Filtrage
    if (filters.name) {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.email) {
      result = result.filter((user) =>
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    // Obtenir le compte total avant pagination
    const total = result.length;

    // Pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Appliquer la pagination
    const paginatedUsers = result
      .slice(startIndex, endIndex)
      .map(({ password, ...user }) => user);

    return {
      data: paginatedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Fonctions pour l'authentification
  findByUsername: (username) => {
    return users.find((user) => user.username === username);
  },

  validatePassword: async (plainPassword, hashedPassword) => {
    try {
      // Pour les mots de passe en clair actuellement dans la base de données
      if (
        !hashedPassword.startsWith("$2a$") &&
        !hashedPassword.startsWith("$2b$")
      ) {
        return plainPassword === hashedPassword;
      }

      // Pour les mots de passe hashés
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Erreur lors de la validation du mot de passe:", error);
      return false;
    }
  },
};
