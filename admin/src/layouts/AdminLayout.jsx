import React from "react";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./adminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Navbar />

      <div className="admin-body">
        <Sidebar />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
