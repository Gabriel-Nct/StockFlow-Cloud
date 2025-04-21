import React, { useState } from "react";
import { FiSave, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "StockFlow Cloud",
    email: "contact@stockflow.com",
    phone: "+33 1 23 45 67 89",
    address: "123 Rue de la Paix, 75000 Paris",
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@stockflow.com",
    smtpPassword: "••••••••",
    senderName: "StockFlow Notifications",
    senderEmail: "notifications@stockflow.com",
  });

  const [inventorySettings, setInventorySettings] = useState({
    lowStockThreshold: "20",
    enableNotifications: true,
    automaticReorders: false,
    defaultCategory: "Non catégorisé",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fonction pour gérer la soumission du formulaire des paramètres généraux
  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simule une requête API
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Paramètres généraux mis à jour avec succès");

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 800);
  };

  // Fonction pour gérer la soumission du formulaire des paramètres email
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simule une requête API
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Paramètres email mis à jour avec succès");

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 800);
  };

  // Fonction pour gérer la soumission du formulaire des paramètres d'inventaire
  const handleInventorySubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simule une requête API
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Paramètres d'inventaire mis à jour avec succès");

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 800);
  };

  // Fonction pour tester la connexion email
  const testEmailConnection = () => {
    setLoading(true);

    // Simule une requête API
    setTimeout(() => {
      setLoading(false);
      alert("Test de connexion SMTP réussi !");
    }, 1000);
  };

  // Si l'utilisateur n'est pas admin, rediriger ou afficher un message
  if (!isAdmin) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex items-center">
          <FiAlertTriangle className="text-red-500 mr-2" />
          <span className="text-red-700">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Paramètres du système
      </h1>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Paramètres généraux */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Paramètres généraux
          </h3>
          <div className="mt-5">
            <form onSubmit={handleGeneralSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom de l'entreprise
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={generalSettings.companyName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={generalSettings.email}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Téléphone
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={generalSettings.phone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresse
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={generalSettings.address}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={loading}
                >
                  <FiSave className="mr-2 -ml-1 h-5 w-5" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sections supplémentaires pour les paramètres */}
      {/* Paramètres email */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Configuration email (SMTP)
          </h3>
          <div className="mt-5">
            <form onSubmit={handleEmailSubmit}>
              {/* Formulaire SMTP */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="smtpServer"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Serveur SMTP
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="smtpServer"
                      id="smtpServer"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={emailSettings.smtpServer}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpServer: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="smtpPort"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Port SMTP
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="smtpPort"
                      id="smtpPort"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={emailSettings.smtpPort}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpPort: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Autres champs du formulaire */}
              </div>
              <div className="mt-5 flex space-x-3">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={loading}
                >
                  <FiSave className="mr-2 -ml-1 h-5 w-5" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={testEmailConnection}
                  disabled={loading}
                >
                  <FiRefreshCw className="mr-2 -ml-1 h-5 w-5" />
                  Tester la connexion
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Paramètres d'inventaire */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Paramètres d'inventaire
          </h3>
          <div className="mt-5">
            <form onSubmit={handleInventorySubmit}>
              {/* Contenu du formulaire */}
              <div className="mt-5">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={loading}
                >
                  <FiSave className="mr-2 -ml-1 h-5 w-5" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
