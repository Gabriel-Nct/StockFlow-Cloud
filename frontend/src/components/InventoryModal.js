import React, { useState, useEffect } from "react";
import { FiX, FiSearch } from "react-icons/fi";

const InventoryModal = ({ type, products, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    reason: "",
    reference: "",
    notes: "",
    type: type, // 'in' ou 'out'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filtrer les produits lors de la recherche
  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  // Définir les raisons disponibles en fonction du type de mouvement
  const getReasons = () => {
    if (type === "in") {
      return [
        { value: "purchase", label: "Achat" },
        { value: "return", label: "Retour" },
        { value: "adjustment", label: "Ajustement" },
        { value: "other", label: "Autre" },
      ];
    } else {
      return [
        { value: "sale", label: "Vente" },
        { value: "damaged", label: "Endommagé" },
        { value: "adjustment", label: "Ajustement" },
        { value: "other", label: "Autre" },
      ];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur lors de la modification du champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_id) {
      newErrors.product_id = "Veuillez sélectionner un produit";
    }

    if (!formData.quantity) {
      newErrors.quantity = "La quantité est requise";
    } else if (
      isNaN(parseInt(formData.quantity)) ||
      parseInt(formData.quantity) <= 0
    ) {
      newErrors.quantity = "La quantité doit être un nombre entier positif";
    } else if (type === "out") {
      // Vérifier si la quantité est disponible pour une sortie de stock
      const selectedProduct = products.find(
        (p) => p.id === parseInt(formData.product_id)
      );
      if (
        selectedProduct &&
        parseInt(formData.quantity) > selectedProduct.quantity
      ) {
        newErrors.quantity = `Quantité insuffisante en stock (disponible: ${selectedProduct.quantity})`;
      }
    }

    if (!formData.reason) {
      newErrors.reason = "La raison est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Préparer les données pour la sauvegarde
      const processedData = {
        ...formData,
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
      };

      await onSave(processedData);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du mouvement:", err);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le titre du modal en fonction du type
  const getModalTitle = () => {
    return type === "in"
      ? "Enregistrer une entrée de stock"
      : "Enregistrer une sortie de stock";
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Fond semi-transparent */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Centrer le modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Fermer</span>
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {getModalTitle()}
                </h3>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Recherche de produit */}
                  <div>
                    <label
                      htmlFor="product_search"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rechercher un produit{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="product_search"
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Nom ou SKU du produit"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Liste des produits filtrés */}
                  <div>
                    <label
                      htmlFor="product_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sélectionner un produit{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="product_id"
                      id="product_id"
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                        errors.product_id ? "border-red-500" : ""
                      }`}
                      value={formData.product_id}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner un produit</option>
                      {filteredProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.sku} (Stock:{" "}
                          {product.quantity})
                        </option>
                      ))}
                    </select>
                    {errors.product_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.product_id}
                      </p>
                    )}
                  </div>

                  {/* Quantité */}
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantité <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      min="1"
                      className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                        errors.quantity ? "border-red-500" : ""
                      }`}
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Raison */}
                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Raison <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="reason"
                      id="reason"
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                        errors.reason ? "border-red-500" : ""
                      }`}
                      value={formData.reason}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner une raison</option>
                      {getReasons().map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                    {errors.reason && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.reason}
                      </p>
                    )}
                  </div>

                  {/* Référence */}
                  <div>
                    <label
                      htmlFor="reference"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Référence
                    </label>
                    <input
                      type="text"
                      name="reference"
                      id="reference"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder={
                        type === "in"
                          ? "N° Commande, Bon de livraison..."
                          : "N° Facture, Bon de sortie..."
                      }
                      value={formData.reference}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows="3"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Informations complémentaires..."
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                type === "in"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === "in" ? "focus:ring-green-500" : "focus:ring-red-500"
              } sm:ml-3 sm:w-auto sm:text-sm ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                "Enregistrer"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
