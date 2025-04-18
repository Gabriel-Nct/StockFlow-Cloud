import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import ProductModal from "../components/ProductModal";

const Products = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fonction pour charger les produits
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Dans un environnement réel, vous feriez un appel API
      // Simulons des données pour le moment
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Données fictives pour la démonstration
      const mockProducts = [
        {
          id: 1,
          sku: "LAP-DEL-001",
          name: "Ordinateur portable Dell XPS 13",
          description: 'Ordinateur portable haut de gamme avec écran 13"',
          category: "Informatique",
          price: 1299.99,
          cost_price: 950.0,
          quantity: 15,
          min_stock_level: 5,
          location: "Rayon A-12",
        },
        {
          id: 2,
          sku: "MON-LG-001",
          name: 'Moniteur LG 27"',
          description: "Moniteur 4K 27 pouces",
          category: "Périphériques",
          price: 349.99,
          cost_price: 250.0,
          quantity: 3,
          min_stock_level: 8,
          location: "Rayon B-05",
        },
        {
          id: 3,
          sku: "MOUSE-LOG-001",
          name: "Souris Logitech MX Master",
          description: "Souris sans fil ergonomique",
          category: "Périphériques",
          price: 89.99,
          cost_price: 45.0,
          quantity: 40,
          min_stock_level: 10,
          location: "Rayon B-08",
        },
        {
          id: 4,
          sku: "KEY-COR-001",
          name: "Clavier Corsair K70",
          description: "Clavier mécanique gaming RGB",
          category: "Périphériques",
          price: 129.99,
          cost_price: 75.0,
          quantity: 20,
          min_stock_level: 7,
          location: "Rayon B-10",
        },
        {
          id: 5,
          sku: "HD-SEA-001",
          name: "Disque dur Seagate 2TB",
          description: "Disque dur externe 2TB USB 3.0",
          category: "Stockage",
          price: 79.99,
          cost_price: 40.0,
          quantity: 30,
          min_stock_level: 10,
          location: "Rayon C-02",
        },
      ];

      // Filtrer les produits selon les critères
      let filteredProducts = mockProducts;

      if (searchTerm) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (categoryFilter) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category === categoryFilter
        );
      }

      if (showLowStock) {
        filteredProducts = filteredProducts.filter(
          (product) => product.quantity <= product.min_stock_level
        );
      }

      // Extraire les catégories uniques pour le filtre
      const uniqueCategories = [
        ...new Set(mockProducts.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);

      setProducts(filteredProducts);
      setTotalProducts(filteredProducts.length);
      setTotalPages(Math.ceil(filteredProducts.length / 10)); // 10 éléments par page

      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des produits:", err);
      setError(
        "Impossible de charger les produits. Veuillez réessayer plus tard."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, showLowStock, page]);

  // Gérer l'ouverture du modal pour ajouter un produit
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setModalOpen(true);
  };

  // Gérer l'ouverture du modal pour éditer un produit
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  // Gérer la suppression d'un produit
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit?")) {
      try {
        // Dans un environnement réel, vous feriez un appel API DELETE
        // Pour le moment, nous allons simplement simuler la suppression
        await new Promise((resolve) => setTimeout(resolve, 300));

        setProducts(products.filter((product) => product.id !== productId));
        alert("Produit supprimé avec succès");
      } catch (err) {
        console.error("Erreur lors de la suppression du produit:", err);
        alert("Erreur lors de la suppression du produit");
      }
    }
  };

  // Gérer la sauvegarde d'un produit (ajout ou modification)
  const handleSaveProduct = async (productData) => {
    try {
      if (productData.id) {
        // Modification d'un produit existant
        // Dans un environnement réel, vous feriez un appel API PUT
        await new Promise((resolve) => setTimeout(resolve, 300));

        setProducts(
          products.map((product) =>
            product.id === productData.id
              ? { ...product, ...productData }
              : product
          )
        );

        alert("Produit mis à jour avec succès");
      } else {
        // Ajout d'un nouveau produit
        // Dans un environnement réel, vous feriez un appel API POST
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newProduct = {
          ...productData,
          id: Math.max(...products.map((p) => p.id)) + 1, // Simulation d'un ID auto-incrémenté
        };

        setProducts([...products, newProduct]);

        alert("Produit ajouté avec succès");
      }

      setModalOpen(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du produit:", err);
      alert("Erreur lors de la sauvegarde du produit");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des produits
        </h1>

        {isAdmin && (
          <button
            onClick={handleAddProduct}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="mr-2" />
            Ajouter un produit
          </button>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Rechercher par nom ou SKU"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 md:max-w-xs">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="lowStock"
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
            />
            <label
              htmlFor="lowStock"
              className="ml-2 block text-sm text-gray-700"
            >
              Stock bas uniquement
            </label>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <FiAlertTriangle className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      SKU
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nom
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Catégorie
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Prix
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantité
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Emplacement
                    </th>
                    {isAdmin && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        Aucun produit trouvé
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.price.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.quantity <= product.min_stock_level
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.location}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                            >
                              <FiEdit2 className="inline h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="inline h-5 w-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de{" "}
              <span className="font-medium">{products.length}</span> produits
              sur <span className="font-medium">{totalProducts}</span>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                  page === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                  page === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal pour ajouter/éditer un produit */}
      {modalOpen && (
        <ProductModal
          product={currentProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Products;
