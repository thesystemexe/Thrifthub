import React, { useEffect } from "react";
import { Store, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/pendingAppWid.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingVerifications } from "../features/admin/adminSlice";

const PendingAppsWid = () => {
  const { pendingSellers } = useSelector((store) => store.admin);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPendingVerifications());
  }, [dispatch]);

  console.log(pendingSellers);

  return (
    <div className="pending-widget">
      <div className="pending-widget-header">
        <h3>Pending Seller Approvals</h3>
      </div>

      <div className="pending-widget-body">
        {pendingSellers?.length > 0 ? (
          pendingSellers.map((app) => (
            <div className="pending-item" key={app._id}>
              <div className="store-icon">
                <Store size={20} />
              </div>

              <div className="store-details">
                <h4>{app.storeName}</h4>

                <p className="seller-name">
                  Applicant: {app.user?.username || "Unknown User"}
                </p>

                <div className="meta-row">
                  <span className="status-badge">
                    {app.status === "pending" ? "Pending Review" : app.status}
                  </span>

                  <span className="time-tag">
                    <Clock size={12} />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-pending">
            <p>No pending seller applications.</p>
          </div>
        )}
      </div>

      <div className="pending-widget-footer">
        <Link to="/sellers">
          <span>View All Approvals</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default PendingAppsWid;
