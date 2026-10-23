import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  CalendarDays,
  ShieldCheck,
  Shield,
  Store,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  adminGetUserDetail,
  adminUpdateUserRole,
  adminUpdateUserStatus,
  adminDeleteUser,
  clearSelectedUser,
} from "../features/admin/adminSlice";
import "../styles/userDetails.css";
const UserDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { selectedUser, usersLoading, actionLoading, error } = useSelector(
    (state) => state.admin,
  );
  useEffect(() => {
    if (userId) {
      dispatch(adminGetUserDetail(userId));
    }
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, userId]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const handleStatusChange = () => {
    if (!selectedUser) return;
    const newStatus =
      selectedUser.accountStatus === "disabled" ? "active" : "disabled";
    dispatch(
      adminUpdateUserStatus({
        userId: selectedUser._id,
        accountStatus: newStatus,
      }),
    );
  };

  const handleRoleChange = (role) => {
    if (!selectedUser) return;
    const currentRoles = Array.isArray(selectedUser.roles)
      ? selectedUser.roles
      : [];
    let updatedRoles;
    if (currentRoles.includes(role)) {
      updatedRoles = currentRoles.filter((currentRole) => currentRole !== role);
    } else {
      updatedRoles = [...currentRoles, role];
    }
    if (updatedRoles.length === 0) {
      updatedRoles = ["user"];
    }
    dispatch(
      adminUpdateUserRole({ userId: selectedUser._id, roles: updatedRoles }),
    );
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selectedUser.username}?`,
    );
    if (!confirmed) return;
    dispatch(adminDeleteUser(selectedUser._id))
      .unwrap()
      .then(() => {
        navigate("/users");
      })
      .catch(() => {});
  };

  if (usersLoading) {
    return (
      <div className="user-details-page">
        <div className="user-details-state">
          <div className="user-details-spinner" />
          <h3>Loading user details...</h3>
          <p>Please wait while the account information is being loaded.</p>
        </div>
      </div>
    );
  }
  if (error && !selectedUser) {
    return (
      <div className="user-details-page">
        <div className="user-details-back">
          <Link to="/users">
            <ArrowLeft size={15} /> <span>Back to Users</span>
          </Link>
        </div>
        <div className="user-details-state">
          <div className="user-details-state-icon">
            <XCircle size={24} />
          </div>
          <h3>Unable to load user</h3> <p>{error}</p>
          <button
            type="button"
            className="user-details-retry-btn"
            onClick={() => dispatch(adminGetUserDetail(userId))}
          >
            <RefreshCw size={14} /> <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }
  if (!selectedUser) {
    return (
      <div className="user-details-page">
        <div className="user-details-state">
          <div className="user-details-state-icon">
            <User size={24} />
          </div>
          <h3>User not found</h3>
          <p>The requested user account could not be found.</p>
          <Link to="/users" className="user-details-retry-btn">
            <ArrowLeft size={14} /> <span>Back to Users</span>
          </Link>
        </div>
      </div>
    );
  }
  const roles = Array.isArray(selectedUser.roles) ? selectedUser.roles : [];
  const isDisabled = selectedUser.accountStatus === "disabled";
  return (
    <div className="user-details-page">
      <div className="user-details-back">
        <Link to="/users">
          <ArrowLeft size={15} /> <span>Back to Users</span>
        </Link>
      </div>
      <div className="user-details-header">
        <div className="user-details-header-content">
          <span className="user-details-eyebrow"> User Management </span>
          <h1>User Details</h1>
          <p>
            Review account information, roles, verification status and account
            access.
          </p>
        </div>
        <div
          className={`user-details-header-status ${isDisabled ? "is-disabled" : ""}`}
        >
          {isDisabled ? <XCircle size={17} /> : <CheckCircle2 size={17} />}
          <div>
            <span>Account Status</span>
            <strong> {isDisabled ? "Disabled" : "Active"} </strong>
          </div>
        </div>
      </div>
      {error && (
        <div className="user-details-error">
          <span>{error}</span>
        </div>
      )}
      <div className="user-details-layout">
        {/* Profile */}
        <section className="user-details-card user-profile-card">
          <div className="user-profile-top">
            <div className="user-profile-avatar">
              {selectedUser.profilePicture ? (
                <img
                  src={selectedUser.profilePicture}
                  alt={selectedUser.username}
                />
              ) : (
                <span>{getInitials(selectedUser.username)}</span>
              )}
            </div>
            <div className="user-profile-heading">
              <span className="card-eyebrow">Account Profile</span>
              <h2>{selectedUser.username || "Unnamed User"}</h2>
              <p>{selectedUser.email || "No email available"}</p>
            </div>
          </div>
          <div className="user-profile-divider" />
          <div className="user-info-grid">
            <div className="user-info-item">
              <span>Username</span>
              <strong>{selectedUser.username || "N/A"}</strong>
            </div>
            <div className="user-info-item">
              <span>Email Address</span>
              <strong>{selectedUser.email || "N/A"}</strong>
            </div>
            <div className="user-info-item">
              <span>Account Created</span>
              <strong>{formatDate(selectedUser.createdAt)}</strong>
            </div>
            <div className="user-info-item">
              <span>Last Updated</span>
              <strong>{formatDate(selectedUser.updatedAt)}</strong>
            </div>
          </div>
        </section>
        {/* Verification */}
        <section className="user-details-card">
          <div className="user-card-heading">
            <div>
              <span className="card-eyebrow">Verification</span>
              <h2>Account Verification</h2>
            </div>
            {selectedUser.isAccountVerified ? (
              <CheckCircle2 size={20} />
            ) : (
              <XCircle size={20} />
            )}
          </div>
          <div className="verification-status">
            <div
              className={`verification-icon ${selectedUser.isAccountVerified ? "is-verified" : "is-unverified"}`}
            >
              {selectedUser.isAccountVerified ? (
                <CheckCircle2 size={19} />
              ) : (
                <XCircle size={19} />
              )}
            </div>
            <div>
              <strong>
                {selectedUser.isAccountVerified
                  ? "Verified Account"
                  : "Unverified Account"}
              </strong>
              <span>
                {selectedUser.isAccountVerified
                  ? "This account has completed email verification."
                  : "This account has not completed email verification."}
              </span>
            </div>
          </div>
        </section>
        {/* Roles */}
        <section className="user-details-card">
          <div className="user-card-heading">
            <div>
              <span className="card-eyebrow">Permissions</span>
              <h2>User Roles</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          <div className="roles-list">
            {["user", "seller", "admin"].map((role) => {
              const hasRole = roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  className={`role-option ${hasRole ? "is-selected" : ""}`}
                  onClick={() => handleRoleChange(role)}
                  disabled={actionLoading}
                >
                  <div className="role-option-icon">
                    {role === "admin" ? (
                      <Shield size={15} />
                    ) : role === "seller" ? (
                      <Store size={15} />
                    ) : (
                      <User size={15} />
                    )}
                  </div>
                  <div className="role-option-content">
                    <strong>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </strong>
                    <span>
                      {role === "admin"
                        ? "Administrative access"
                        : role === "seller"
                          ? "Seller permissions"
                          : "Standard user access"}
                    </span>
                  </div>
                  {hasRole && (
                    <CheckCircle2 size={16} className="role-selected-icon" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="roles-note">
            Changes are applied immediately to this account.
          </p>
        </section>
        {/* Account access */}
        <section className="user-details-card">
          <div className="user-card-heading">
            <div>
              <span className="card-eyebrow">Access Control</span>
              <h2>Account Access</h2>
            </div>
            {isDisabled ? <Ban size={20} /> : <UserCheck size={20} />}
          </div>
          <div className="account-access-content">
            <div
              className={`account-access-status ${isDisabled ? "is-disabled" : "is-active"}`}
            >
              {isDisabled ? <Ban size={18} /> : <UserCheck size={18} />}
              <div>
                <strong>
                  {isDisabled ? "Account Disabled" : "Account Active"}
                </strong>
                <span>
                  {isDisabled
                    ? "This user currently cannot access protected account features."
                    : "This user currently has access to their account."}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`user-status-btn ${isDisabled ? "activate" : "disable"}`}
              onClick={handleStatusChange}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <RefreshCw size={14} className="is-spinning" />
                  <span>Updating...</span>
                </>
              ) : isDisabled ? (
                <>
                  <UserCheck size={14} /> <span>Activate Account</span>
                </>
              ) : (
                <>
                  <Ban size={14} /> <span>Disable Account</span>
                </>
              )}
            </button>
          </div>
        </section>
        {/* Dates */}
        <section className="user-details-card user-account-history">
          <div className="user-card-heading">
            <div>
              <span className="card-eyebrow">Account History</span>
              <h2>Timeline</h2>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="timeline-icon">
                <CalendarDays size={15} />
              </div>
              <div>
                <span>Account Created</span>
                <strong> {formatDateTime(selectedUser.createdAt)} </strong>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">
                <RefreshCw size={15} />
              </div>
              <div>
                <span>Last Updated</span>
                <strong> {formatDateTime(selectedUser.updatedAt)} </strong>
              </div>
            </div>
          </div>
        </section>
        {/* Danger zone */}
        <section className="user-details-card user-danger-card">
          <div className="user-card-heading">
            <div>
              <span className="card-eyebrow">Danger Zone</span>
              <h2>Delete Account</h2>
            </div>
            <Trash2 size={20} />
          </div>
          <div className="danger-content">
            <div>
              <strong>Permanently delete this user</strong>
              <p>
                This action cannot be undone. The user's account and associated
                profile will be removed permanently.
              </p>
            </div>
            <button
              type="button"
              className="delete-user-btn"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <RefreshCw size={14} className="is-spinning" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} /> <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
export default UserDetails;
