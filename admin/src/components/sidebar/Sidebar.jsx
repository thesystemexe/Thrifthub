import React from "react";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingBag,
  User,
  PackageCheck,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Pending Sellers",
      path: "/pendingSellers",
      icon: Store,
    },
    {
      label: "Sellers",
      path: "/sellers",
      icon: Users,
    },
    {
      label: "Products",
      path: "/products",
      icon: ShoppingBag,
    },
    {
      label: "Users",
      path: "/users",
      icon: User,
    },
    {
      label: "Orders",
      path: "/orders",
      icon: PackageCheck,
    },
    {
      label: "Reviews",
      path: "/reviews",
      icon: Star,
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-section-label">Workspace</div>

      <nav className="sidebar-navigation">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-section-label">System</div>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>

        <button className="sidebar-logout">
          <LogOut size={18} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <span>THRIFTHUB ADMIN</span>
        <span>v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
