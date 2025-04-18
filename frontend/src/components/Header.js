import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 md:hidden focus:outline-none"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-primary-700 ml-2 md:ml-0">
            StockFlow Cloud
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification icon */}
          <button className="p-1 text-gray-500 hover:text-primary-600 focus:outline-none">
            <FiBell className="h-6 w-6" />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <FiUser />
              </div>
              <span className="hidden md:inline-block font-medium text-gray-700">
                {currentUser?.name || "Utilisateur"}
              </span>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{currentUser?.name}</p>
                  <p className="text-gray-500">{currentUser?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiLogOut className="mr-2" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
