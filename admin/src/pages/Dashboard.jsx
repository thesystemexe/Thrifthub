import React, { useEffect } from "react";
import { Users, Store, Clock3, CheckCircle2, ShoppingBag } from "lucide-react";
import "../styles/dashboard.css";
import StatCard from "../components/statCard/StatCard";
import Chart from "../components/chart/Chart";
import PendingAppWid from "../components/PendingAppWid";
import { useDispatch, useSelector } from "react-redux";
import { adminGetDashboard } from "../features/admin/adminSlice";

const Dashboard = () => {
  const { dashboard, orderChart, dashboardLoading, error } = useSelector(
    (store) => store.admin,
  );

  const dispatch = useDispatch();

  const {
    totalUsers,
    pendingSellers,
    approvedSellers,
    totalOrders,
    totalProducts,
  } = dashboard;

  useEffect(() => {
    dispatch(adminGetDashboard());
  }, [dispatch]);

  return (
    <div className="admin-dashboard">
      {/* Header */}

      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">ThriftHub Administration</span>

          <h1>Dashboard</h1>

          <p>A quick overview of your marketplace activity.</p>
        </div>

        <div className="dashboard-header-meta">
          <span className="dashboard-meta-dot"></span>
          Live overview
        </div>
      </header>

      {/* Stats */}

      <section className="stats-grid">
        <StatCard title="Total Users" value={totalUsers} icon={Users} />

        <StatCard title="Sellers" value={approvedSellers} icon={Store} />

        <StatCard
          title="Pending Applications"
          value={pendingSellers}
          icon={Clock3}
        />

        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={CheckCircle2}
        />

        <StatCard title="Products" value={totalProducts} icon={ShoppingBag} />
      </section>

      {/* Main Widgets */}

      <section className="dashboard-widgets">
        <div className="chart-widget">
          <div className="widget-heading">
            <div>
              <span className="widget-eyebrow">Orders</span>

              <h2>Order Activity</h2>
            </div>

            <span className="widget-period">Last 7 days</span>
          </div>

          <Chart title="" dataKey="orders" grid={true} data={orderChart} />
        </div>

        <PendingAppWid />
      </section>
    </div>
  );
};

export default Dashboard;
