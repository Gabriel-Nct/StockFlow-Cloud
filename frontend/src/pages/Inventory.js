import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiPlusCircle,
  FiMinusCircle,
  FiSearch,
  FiFilter,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import InventoryModal from "../components/InventoryModal";

const Inventory = () => {
  const { currentUser } = useAuth();

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovements, setTotalMovements] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("in"); // 'in' ou 'out'
  const [products, setProducts] = useState([]);

  // Fonction pour charger les mouvements d'inventaire
  const fetchMovements = async () => {
    try {
      setLoading(true);

      // Dans un environnement réel, vous feriez un appel API
      // Simulons des données pour le moment
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Données fictives pour la démonstration
      const mockMovements = [
        {
          id: 1,
          product_id: 1,
          product_name: "Ordinateur portable Dell XPS 13",
          product_sku: "LAP-DEL-001",
          type: "in",
          quantity: 10,
          reason: "purchase",
          reference: "CMD-001",
          notes: "Livraison du fournisseur principal",
          performed_by: "John Doe",
          performed_at: "2023-05-15T10:30:00Z",
        },
        {
          id: 2,
          product_id: 2,
          product_name: 'Moniteur LG 27"',
          product_sku: "MON-LG-001",
          type: "out",
          quantity: 5,
          reason: "sale",
          reference: "FAC-001",
          notes: "Vente en ligne",
          performed_by: "Jane Smith",
          performed_at: "2023-05-15T11:45:00Z",
        },
        {
          id: 3,
          product_id: 3,
          product_name: "Souris Logitech MX Master",
          product_sku: "MOUSE-LOG-001",
          type: "out",
          quantity: 8,
          reason: "sale",
          reference: "FAC-002",
          notes: "Vente en magasin",
          performed_by: "Jane Smith",
          performed_at: "2023-05-15T13:20:00Z",
        },
        {
          id: 4,
          product_id: 4,
          product_name: "Clavier Corsair K70",
          product_sku: "KEY-COR-001",
          type: "in",
          quantity: 15,
          reason: "purchase",
          reference: "CMD-002",
          notes: "Réapprovisionnement",
          performed_by: "John Doe",
          performed_at: "2023-05-15T14:10:00Z",
        },
        {
          id: 5,
          product_id: 5,
          product_name: "Disque dur Seagate 2TB",
          product_sku: "HD-SEA-001",
          type: "out",
          quantity: 3,
          reason: "damaged",
          reference: "RET-001",
          notes: "Produits endommagés lors du transport",
          performed_by: "John Doe",
          performed_at: "2023-05-15T15:30:00Z",
        },
      ];

      // Filtrer les mouvements selon les critères
      let filteredMovements = mockMovements;

      if (searchTerm) {
        filteredMovements = filteredMovements.filter(
          (movement) =>
            movement.product_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            movement.product_sku
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            movement.reference?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (typeFilter) {
        filteredMovements = filteredMovements.filter(
          (movement) => movement.type === typeFilter
        );
      }

      if (reasonFilter) {
        filteredMovements = filteredMovements.filter(
          (movement) => movement.reason === reasonFilter
        );
      }

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        filteredMovements = filteredMovements.filter(
          (movement) => new Date(movement.performed_at) >= fromDate
        );
      }

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Fin de la journée
        filteredMovements = filteredMovements.filter(
          (movement) => new Date(movement.performed_at) <= toDate
        );
      }

      setMovements(filteredMovements);
      setTotalMovements(filteredMovements.length);
      setTotalPages(Math.ceil(filteredMovements.length / 10)); // 10 éléments par page

      // Simuler le chargement des produits pour le modal
      const mockProducts = [
        {
          id: 1,
          sku: "LAP-DEL-001",
          name: "Ordinateur portable Dell XPS 13",
          quantity: 15,
        },
        {
          id: 2,
          sku: "MON-LG-001",
          name: 'Moniteur LG 27"',
          quantity: 3,
        },
        {
          id: 3,
          sku: "MOUSE-LOG-001",
          name: "Souris Logitech MX Master",
          quantity: 40,
        },
        {
          id: 4,
          sku: "KEY-COR-001",
          name: "Clavier Corsair K70",
          quantity: 20,
        },
        {
          id: 5,
          sku: "HD-SEA-001",
          name: "Disque dur Seagate 2TB",
          quantity: 30,
        },
      ];

      setProducts(mockProducts);

      setLoading(false);
    } catch (err) {
      console.error(
        "Erreur lors du chargement des mouvements d'inventaire:",
        err
      );
      setError(
        "Impossible de charger les mouvements. Veuillez réessayer plus tard."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [searchTerm, typeFilter, reasonFilter, dateRange, page]);

  // Gérer l'ouverture du modal pour ajouter un mouvement
  const handleAddMovement = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  // Gérer la sauvegarde d'un mouvement
  const handleSaveMovement = async (movementData) => {
    try {
      // Dans un environnement réel, vous feriez un appel API POST
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newMovement = {
        id: Math.max(...movements.map((m) => m.id)) + 1, // Simulation d'un ID auto-incrémenté
        ...movementData,
        performed_by: currentUser.name,
        performed_at: new Date().toISOString(),
      };

      // Ajouter des informations produit pour l'affichage
      const product = products.find((p) => p.id === movementData.product_id);
      if (product) {
        newMovement.product_name = product.name;
        newMovement.product_sku = product.sku;
      }

      setMovements([newMovement, ...movements]);

      // Mettre à jour la quantité du produit
      setProducts(
        products.map((product) => {
          if (product.id === movementData.product_id) {
            const quantityChange =
              movementData.type === "in"
                ? movementData.quantity
                : -movementData.quantity;
            return {
              ...product,
              quantity: product.quantity + quantityChange,
            };
          }
          return product;
        })
      );

      alert(
        `Mouvement ${
          movementData.type === "in" ? "d'entrée" : "de sortie"
        } enregistré avec succès`
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du mouvement:", err);
      alert("Erreur lors de l'enregistrement du mouvement");
    }
  };

  // Traduire les types de mouvements et les raisons
  const translateType = (type) => {
    switch (type) {
      case "in":
        return "Entrée";
      case "out":
        return "Sortie";
      default:
        return type;
    }
  };

  const translateReason = (reason) => {
    switch (reason) {
      case "purchase":
        return "Achat";
      case "sale":
        return "Vente";
      case "return":
        return "Retour";
      case "damaged":
        return "Endommagé";
      case "adjustment":
        return "Ajustement";
      case "other":
        return "Autre";
      default:
        return reason;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Mouvements d'inventaire
        </h1>

        <div className="flex space-x-3">
          <button
            onClick={() => handleAddMovement("in")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlusCircle className="mr-2" />
            Entrée de stock
          </button>

          <button
            onClick={() => handleAddMovement("out")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiMinusCircle className="mr-2" />
            Sortie de stock
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Rechercher produit ou référence"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="in">Entrées</option>
              <option value="out">Sorties</option>
            </select>
          </div>

          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
            >
              <option value="">Toutes les raisons</option>
              <option value="purchase">Achat</option>
              <option value="sale">Vente</option>
              <option value="return">Retour</option>
              <option value="damaged">Endommagé</option>
              <option value="adjustment">Ajustement</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="date"
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Du"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
              />
            </div>
            <div>
              <input
                type="date"
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Au"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des mouvements */}
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
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Produit
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
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
                      Raison
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Référence
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Utilisateur
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        Aucun mouvement trouvé
                      </td>
                    </tr>
                  ) : (
                    movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(movement.performed_at).toLocaleString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {movement.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movement.product_sku}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              movement.type === "in"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {translateType(movement.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {translateReason(movement.reason)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.reference || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.performed_by}
                        </td>
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
              <span className="font-medium">{movements.length}</span> mouvements
              sur <span className="font-medium">{totalMovements}</span>
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

      {/* Modal pour ajouter un mouvement */}
      {modalOpen && (
        <InventoryModal
          type={modalType}
          products={products}
          onSave={handleSaveMovement}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Inventory;
