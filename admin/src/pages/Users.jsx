import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Users as UsersIcon,
  User,
  ShieldCheck,
  Store,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Ban,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  adminGetUsers,
  adminUpdateUserStatus,
  adminDeleteUser,
} from "../features/admin/adminSlice";

import Pagination from "../components/pagination/Pagination";

import "../styles/users.css";

const Users = () => {
  const dispatch = useDispatch();

  const {
    users = [],
    totalCount = 0,
    currentPage = 1,
    resultPerPage = 6,
    totalPages = 0,
    usersLoading,
    actionLoading,
    error,
  } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");

  // =========================
  // INITIAL FETCH / SEARCH
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        adminGetUsers({
          page: 1,
          keyword: search,
        }),
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch, search]);

  // =========================
  // PAGE CHANGE
  // =========================

  const handlePageChange = (page) => {
    if (page === currentPage) return;

    dispatch(
      adminGetUsers({
        page,
        keyword: search,
      }),
    );
  };

  // =========================
  // REFRESH
  // =========================

  const handleRefresh = () => {
    dispatch(
      adminGetUsers({
        page: currentPage,
        keyword: search,
      }),
    );
  };

  // =========================
  // ACCOUNT STATUS
  // =========================

  const handleStatusChange = (user) => {
    const nextStatus = user.accountStatus === "active" ? "disabled" : "active";

    dispatch(
      adminUpdateUserStatus({
        userId: user._id,
        accountStatus: nextStatus,
      }),
    );
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${user.username}"?`,
    );

    if (!confirmed) return;

    dispatch(adminDeleteUser(user._id));
  };

  // =========================
  // HELPERS
  // =========================

  const getRoles = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0) {
      return ["user"];
    }

    return roles;
  };

  const getPrimaryRole = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0) {
      return "user";
    }

    if (roles.includes("admin")) return "admin";
    if (roles.includes("seller")) return "seller";

    return "user";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") {
      return <ShieldCheck size={13} />;
    }

    if (role === "seller") {
      return <Store size={13} />;
    }

    return <User size={13} />;
  };

  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const startItem =
    totalCount === 0 ? 0 : (currentPage - 1) * resultPerPage + 1;

  const endItem = Math.min(currentPage * resultPerPage, totalCount);

  // =========================
  // RENDER
  // =========================

  return (
    <div className="users-page">
      {/* HEADER */}

      <div className="users-header">
        <div className="users-header-content">
          <span className="users-eyebrow">User Management</span>

          <h1>Users</h1>

          <p>
            Manage ThriftHub user accounts, account access, roles, and platform
            activity.
          </p>
        </div>

        <div className="users-header-stat">
          <UsersIcon size={18} />

          <div>
            <span>Total Users</span>
            <strong>{totalCount}</strong>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}

      <div className="users-toolbar">
        <div className="users-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            aria-label="Search users"
          />

          {search && (
            <button
              type="button"
              className="users-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="users-refresh-btn"
          onClick={handleRefresh}
          disabled={usersLoading}
        >
          <RefreshCw
            size={15}
            className={usersLoading ? "users-is-spinning" : ""}
          />

          <span>Refresh</span>
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="users-error">
          <span>{error}</span>

          <button type="button" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      )}

      {/* TABLE CARD */}

      <div className="users-table-card">
        <div className="users-table-top">
          <div>
            <span className="users-table-eyebrow">Account Directory</span>

            <h2>Registered Users</h2>
          </div>

          <div className="users-table-count">
            <UsersIcon size={15} />

            <span>
              {totalCount} {totalCount === 1 ? "user" : "users"}
            </span>
          </div>
        </div>

        {usersLoading ? (
          <div className="users-loading">
            <div className="users-spinner" />
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="users-empty">
            <div className="users-empty-icon">
              <UsersIcon size={25} />
            </div>

            <h3>Unable to load users</h3>

            <p>{error}</p>

            <button type="button" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty">
            <div className="users-empty-icon">
              <UsersIcon size={25} />
            </div>

            <h3>{search ? "No users found" : "No users yet"}</h3>

            <p>
              {search
                ? "Try searching with a different username or email."
                : "There are currently no registered users."}
            </p>

            {search && (
              <button type="button" onClick={() => setSearch("")}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Roles</th>
                    <th>Account Status</th>
                    <th>Joined</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const roles = getRoles(user.roles);
                    const primaryRole = getPrimaryRole(user.roles);

                    return (
                      <tr key={user._id}>
                        {/* USER */}

                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.username}
                                />
                              ) : (
                                <User size={17} />
                              )}
                            </div>

                            <div className="user-cell-info">
                              <strong>{user.username || "Unnamed User"}</strong>

                              <span>{user.email || "N/A"}</span>
                            </div>
                          </div>
                        </td>

                        {/* ROLES */}

                        <td>
                          <div className="user-roles">
                            {roles.map((role) => (
                              <span
                                key={role}
                                className={`user-role-badge role-${role}`}
                              >
                                {getRoleIcon(role)}
                                {formatRole(role)}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`user-status ${
                              user.accountStatus === "active"
                                ? "status-active"
                                : "status-disabled"
                            }`}
                          >
                            {user.accountStatus === "active" ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}

                            <span>
                              {user.accountStatus === "active"
                                ? "Active"
                                : "Disabled"}
                            </span>
                          </span>
                        </td>

                        {/* DATE */}

                        <td>
                          <span className="user-date">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                        {/* VERIFICATION */}

                        <td>
                          {user.isAccountVerified ? (
                            <span className="verification-badge verified">
                              <CheckCircle2 size={13} />
                              Verified
                            </span>
                          ) : (
                            <span className="verification-badge unverified">
                              <XCircle size={13} />
                              Unverified
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="user-actions">
                            <Link
                              to={`/user/${user._id}`}
                              className="user-view-btn"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </Link>

                            <button
                              type="button"
                              className={`user-status-btn ${
                                user.accountStatus === "active"
                                  ? "disable"
                                  : "activate"
                              }`}
                              onClick={() => handleStatusChange(user)}
                              disabled={actionLoading}
                              title={
                                user.accountStatus === "active"
                                  ? "Disable user"
                                  : "Activate user"
                              }
                            >
                              {user.accountStatus === "active" ? (
                                <Ban size={14} />
                              ) : (
                                <UserCheck size={14} />
                              )}
                            </button>

                            <button
                              type="button"
                              className="user-delete-btn"
                              onClick={() => handleDelete(user)}
                              disabled={actionLoading}
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}

            <div className="users-table-footer">
              <span className="users-showing-text">
                Showing <strong>{startItem}</strong> –{" "}
                <strong>{endItem}</strong> of <strong>{totalCount}</strong>
              </span>

              <Pagination
                storeKey="admin"
                dataKey="users"
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
