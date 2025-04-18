import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiBox,
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
} from "react-icons/fi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    movementsToday: 0,
    recentMovements: [],
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Entrées",
        data: [],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
      },
      {
        label: "Sorties",
        data: [],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
      },
    ],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Dans un environnement réel, vous feriez des appels API ici
        // Simulons des données pour le moment

        // Exemple de simulation d'appel API avec un délai
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Données fictives pour la démonstration
        const mockStats = {
          totalProducts: 150,
          lowStockProducts: 12,
          movementsToday: 28,
          recentMovements: [
            {
              id: 1,
              product_name: "Ordinateur portable Dell XPS 13",
              type: "in",
              quantity: 10,
              reason: "purchase",
              performed_at: "2023-05-15T10:30:00Z",
            },
            {
              id: 2,
              product_name: 'Moniteur LG 27"',
              type: "out",
              quantity: 5,
              reason: "sale",
              performed_at: "2023-05-15T11:45:00Z",
            },
            {
              id: 3,
              product_name: "Souris Logitech MX Master",
              type: "out",
              quantity: 8,
              reason: "sale",
              performed_at: "2023-05-15T13:20:00Z",
            },
            {
              id: 4,
              product_name: "Clavier Corsair K70",
              type: "in",
              quantity: 15,
              reason: "purchase",
              performed_at: "2023-05-15T14:10:00Z",
            },
            {
              id: 5,
              product_name: "Disque dur Seagate 2TB",
              type: "out",
              quantity: 3,
              reason: "damaged",
              performed_at: "2023-05-15T15:30:00Z",
            },
          ],
        };

        setStats(mockStats);

        // Données fictives pour le graphique
        const lastWeek = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
          });
        });

        setChartData({
          labels: lastWeek,
          datasets: [
            {
              label: "Entrées",
              data: [12, 19, 5, 8, 15, 10, 20],
              borderColor: "rgb(34, 197, 94)",
              backgroundColor: "rgba(34, 197, 94, 0.5)",
            },
            {
              label: "Sorties",
              data: [8, 15, 10, 5, 12, 8, 15],
              borderColor: "rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.5)",
            },
          ],
        });

        setLoading(false);
      } catch (err) {
        console.error(
          "Erreur lors du chargement des données du tableau de bord:",
          err
        );
        setError(
          "Impossible de charger les données. Veuillez réessayer plus tard."
        );
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex items-center">
          <FiAlertTriangle className="text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FiBox className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              Total des produits
            </h2>
            <p className="text-xl font-semibold">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              Produits en stock bas
            </h2>
            <p className="text-xl font-semibold">{stats.lowStockProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FiTrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              Mouvements aujourd'hui
            </h2>
            <p className="text-xl font-semibold">{stats.movementsToday}</p>
          </div>
        </div>
      </div>

      {/* Graphique des mouvements */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">
          Mouvements de stock (7 derniers jours)
        </h2>
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Mouvements récents */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Mouvements récents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentMovements.map((movement) => (
                <tr key={movement.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {movement.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.type === "in"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {movement.type === "in" ? "Entrée" : "Sortie"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {movement.reason === "purchase" && "Achat"}
                    {movement.reason === "sale" && "Vente"}
                    {movement.reason === "return" && "Retour"}
                    {movement.reason === "damaged" && "Endommagé"}
                    {movement.reason === "adjustment" && "Ajustement"}
                    {movement.reason === "other" && "Autre"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(movement.performed_at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
