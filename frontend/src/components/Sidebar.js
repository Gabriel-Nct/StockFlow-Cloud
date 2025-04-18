import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiBox, FiPackage, FiUsers, FiSettings } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // Classe active pour les liens de navigation
  const activeClass = "bg-primary-700 text-white";
  const inactiveClass = "text-white hover:bg-primary-700";

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-primary-700">
        <h1 className="text-xl font-bold text-white">StockFlow Cloud</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg ${
                  isActive ? activeClass : inactiveClass
                }`
              }
              end
            >
              <FiHome className="h-5 w-5 mr-3" />
              <span>Tableau de bord</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg ${
                  isActive ? activeClass : inactiveClass
                }`
              }
            >
              <FiBox className="h-5 w-5 mr-3" />
              <span>Produits</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg ${
                  isActive ? activeClass : inactiveClass
                }`
              }
            >
              <FiPackage className="h-5 w-5 mr-3" />
              <span>Inventaire</span>
            </NavLink>
          </li>

          {/* Afficher ces options uniquement pour les administrateurs */}
          {isAdmin && (
            <>
              <li className="mt-6 px-4">
                <h2 className="text-xs uppercase tracking-wide text-gray-300">
                  Administration
                </h2>
              </li>
              <li>
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <FiUsers className="h-5 w-5 mr-3" />
                  <span>Utilisateurs</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <FiSettings className="h-5 w-5 mr-3" />
                  <span>Paramètres</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Pied de page avec informations utilisateur */}
      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {currentUser?.name || "Utilisateur"}
            </p>
            <p className="text-xs text-gray-300">
              {currentUser?.role || "user"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
