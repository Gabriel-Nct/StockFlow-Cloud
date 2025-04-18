import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar pour mobile (avec overlay) */}
      <div
        className={`md:hidden ${
          sidebarOpen ? "block" : "hidden"
        } fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transform fixed md:static inset-y-0 left-0 z-30 w-64 
        bg-primary-800 text-white transition-transform duration-300 ease-in-out
      `}
      >
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
