import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const ProductModal = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    name: "",
    description: "",
    category: "",
    price: "",
    cost_price: "",
    quantity: "",
    min_stock_level: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialiser le formulaire si un produit est fourni pour édition
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || "",
        sku: product.sku || "",
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price !== undefined ? product.price.toString() : "",
        cost_price:
          product.cost_price !== undefined ? product.cost_price.toString() : "",
        quantity:
          product.quantity !== undefined ? product.quantity.toString() : "",
        min_stock_level:
          product.min_stock_level !== undefined
            ? product.min_stock_level.toString()
            : "",
        location: product.location || "",
      });
    }
  }, [product]);

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

    if (!formData.sku.trim()) {
      newErrors.sku = "Le SKU est requis";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Le prix est requis";
    } else if (
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) < 0
    ) {
      newErrors.price = "Le prix doit être un nombre positif";
    }

    if (
      formData.cost_price.trim() &&
      (isNaN(parseFloat(formData.cost_price)) ||
        parseFloat(formData.cost_price) < 0)
    ) {
      newErrors.cost_price = "Le prix d'achat doit être un nombre positif";
    }

    if (
      formData.quantity.trim() &&
      (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 0)
    ) {
      newErrors.quantity = "La quantité doit être un nombre entier positif";
    }

    if (
      formData.min_stock_level.trim() &&
      (isNaN(parseInt(formData.min_stock_level)) ||
        parseInt(formData.min_stock_level) < 0)
    ) {
      newErrors.min_stock_level =
        "Le niveau de stock minimal doit être un nombre entier positif";
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
      // Convertir les valeurs numériques
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        cost_price: formData.cost_price
          ? parseFloat(formData.cost_price)
          : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        min_stock_level: formData.min_stock_level
          ? parseInt(formData.min_stock_level)
          : undefined,
      };

      await onSave(processedData);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du produit:", err);
    } finally {
      setLoading(false);
    }
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
                  {product
                    ? "Modifier le produit"
                    : "Ajouter un nouveau produit"}
                </h3>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* SKU */}
                  <div>
                    <label
                      htmlFor="sku"
                      className="block text-sm font-medium text-gray-700"
                    >
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      id="sku"
                      className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                        errors.sku ? "border-red-500" : ""
                      }`}
                      value={formData.sku}
                      onChange={handleChange}
                      disabled={product !== null}
                    />
                    {errors.sku && (
                      <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows="3"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Catégorie
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <select
                        name="category"
                        id="category"
                        className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prix et Prix d'achat */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Prix <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="price"
                          id="price"
                          className={`focus:ring-primary-500 focus:border-primary-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md ${
                            errors.price ? "border-red-500" : ""
                          }`}
                          placeholder="0.00"
                          value={formData.price}
                          onChange={handleChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="cost_price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Prix d'achat
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="cost_price"
                          id="cost_price"
                          className={`focus:ring-primary-500 focus:border-primary-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md ${
                            errors.cost_price ? "border-red-500" : ""
                          }`}
                          placeholder="0.00"
                          value={formData.cost_price}
                          onChange={handleChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                      </div>
                      {errors.cost_price && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cost_price}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantité et Niveau de stock minimal */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Quantité
                      </label>
                      <input
                        type="text"
                        name="quantity"
                        id="quantity"
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

                    <div>
                      <label
                        htmlFor="min_stock_level"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Niveau de stock minimal
                      </label>
                      <input
                        type="text"
                        name="min_stock_level"
                        id="min_stock_level"
                        className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          errors.min_stock_level ? "border-red-500" : ""
                        }`}
                        value={formData.min_stock_level}
                        onChange={handleChange}
                      />
                      {errors.min_stock_level && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.min_stock_level}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Emplacement */}
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Emplacement
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.location}
                      onChange={handleChange}
                    />
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
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm ${
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

export default ProductModal;
