import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSellerDetails,
  approveSeller,
  rejectSeller,
} from "../features/admin/adminSlice";
import {
  Store,
  MapPin,
  Phone,
  CalendarDays,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  AlertCircle,
  ArrowLeft,
  User,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import "../styles/sellerVerification.css";
const SellerVerification = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    selectedSeller: seller,
    sellerLoading,
    actionLoading,
    error,
  } = useSelector((state) => state.admin);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchSellerDetails(sellerId));
    }
  }, [dispatch, sellerId]);

  const handleApprove = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this seller application?",
    );
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      await dispatch(approveSeller(sellerId)).unwrap();
      alert("Seller approved successfully.");
      navigate("/pendingSellers");
    } catch (err) {
      alert(err || "Failed to approve seller.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(
        rejectSeller({ sellerId, rejection: rejectReason.trim() }),
      ).unwrap();
      alert("Seller application rejected.");
      setShowRejectBox(false);
      setRejectReason("");
      navigate("/pendingSellers");
    } catch (err) {
      alert(err || "Failed to reject seller.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancelReject = () => {
    if (isSubmitting) return;
    setShowRejectBox(false);
    setRejectReason("");
  };
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const getDocumentLabel = (docType) => {
    if (!docType) return "Verification Document";
    return docType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const getFormattedAddress = (address) => {
    if (!address) return "No address provided";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address provided";
  };
  /* * Error state should be checked before the empty seller state. * Otherwise a failed request can keep showing the actionLoading screen. */ if (
    error
  ) {
    return (
      <div className="seller-verification-page">
        <div className="verification-state error-state">
          <div className="state-icon error-icon">
            <AlertCircle size={34} />
          </div>
          <h2>Unable to Load Application</h2> <p>{error}</p>
          <button
            type="button"
            className="state-back-btn"
            onClick={() => navigate("/pendingSellers")}
          >
            <ArrowLeft size={16} /> Back to Pending Sellers
          </button>
        </div>
      </div>
    );
  }
  if (sellerLoading || !seller) {
    return (
      <div className="seller-verification-page">
        <div className="verification-state actionLoading-state">
          <div className="verification-spinner" />
          <h2>Loading Seller Application</h2>
          <p>
            Please wait while we retrieve the submitted verification details.
          </p>
        </div>
      </div>
    );
  }
  const {
    storeName,
    storeDescription,
    phone,
    businessAddress,
    documents = [],
    status = "pending",
    createdAt,
    user,
    rejectionReason,
  } = seller;

  const normalizedStatus = status.toLowerCase();
  return (
    <div className="seller-verification-page">
      {/* ===================================================== PAGE HEADER ===================================================== */}
      <header className="verification-header">
        <div className="verification-header-left">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={17} /> <span>Back</span>
          </button>
          <div className="header-title">
            <span className="eyebrow"> Seller Verification </span>
            <h1>{storeName || "Seller Application"}</h1>
            <p>
              Review the seller's submitted business information and
              verification documents.
            </p>
          </div>
        </div>
        <div className={`status-badge ${normalizedStatus}`}>
          {normalizedStatus === "pending" && <Clock3 size={14} />}
          {normalizedStatus === "approved" && <CheckCircle2 size={14} />}
          {normalizedStatus === "rejected" && <XCircle size={14} />}
          <span>{status}</span>
        </div>
      </header>
      {/* ===================================================== MAIN LAYOUT ===================================================== */}
      <div className="verification-layout">
        {/* =================================================== LEFT COLUMN =================================================== */}
        <main className="verification-main">
          {/* Store Overview */}
          <section className="verification-card store-card">
            <div className="store-overview">
              <div className="store-icon-wrapper">
                <Store size={28} strokeWidth={1.8} />
              </div>
              <div className="store-overview-content">
                <span className="card-eyebrow"> Store Application </span>
                <h2>{storeName || "Unnamed Store"}</h2>
                {user && (
                  <div className="owner-row">
                    <User size={14} />
                    <span>
                      Registered user:
                      {typeof user === "object"
                        ? user.name || user.username || user.email || user._id
                        : user}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* Store Description */}
          <section className="verification-card">
            <div className="section-heading">
              <div>
                <span className="card-eyebrow"> About the Store </span>
                <h3>Store Description</h3>
              </div>
            </div>
            <p className="description-text">
              {storeDescription || "No store description was provided."}
            </p>
          </section>
          {/* Business Information */}
          <section className="verification-card">
            <div className="section-heading">
              <div>
                <span className="card-eyebrow">Submitted Information</span>
                <h3>Business Information</h3>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <MapPin size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label"> Business Address </span>
                  <p className="info-value">
                    {getFormattedAddress(businessAddress)}
                  </p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">
                  <Phone size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label"> Phone Number </span>
                  <p className="info-value">
                    {phone || "No phone number provided"}
                  </p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">
                  <CalendarDays size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label"> Application Date </span>
                  <p className="info-value"> {formatDate(createdAt)} </p>
                </div>
              </div>
            </div>
          </section>
          {/* Rejection Information */}
          {normalizedStatus === "rejected" && rejectionReason && (
            <section className="verification-card rejection-info-card">
              <div className="rejection-heading">
                <XCircle size={19} />
                <div>
                  <span className="card-eyebrow"> Previous Decision </span>
                  <h3>Rejection Reason</h3>
                </div>
              </div>
              <p>{rejectionReason}</p>
            </section>
          )}
        </main>
        {/* =================================================== RIGHT COLUMN =================================================== */}
        <aside className="verification-sidebar">
          {/* Documents */}
          <section className="verification-card documents-card">
            <div className="section-heading">
              <div>
                <span className="card-eyebrow"> Verification </span>
                <h3>Submitted Documents</h3>
              </div>
              <div className="document-count"> {documents.length} </div>
            </div>
            <p className="section-description">
              Review the documents submitted by the seller before making a
              verification decision.
            </p>
            <div className="documents-list">
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <div key={doc._id || index} className="document-item">
                    <div className="document-main">
                      <div className="document-icon">
                        <FileText size={19} />
                      </div>
                      <div className="document-details">
                        <span className="document-type">
                          {getDocumentLabel(doc.docType)}
                        </span>
                        <span className="document-sub">Submitted document</span>
                      </div>
                    </div>
                    {doc.url && (
                      <div className="document-actions">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-btn"
                          aria-label="View document"
                          title="View document"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <a
                          href={doc.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-btn"
                          aria-label="Download document"
                          title="Download document"
                        >
                          <Download size={15} />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-documents">
                  <FileText size={24} />
                  <p> No verification documents were attached. </p>
                </div>
              )}
            </div>
          </section>
          {/* Decision Card */}
          {normalizedStatus === "pending" && (
            <section className="verification-card decision-card">
              <div className="decision-header">
                <div className="decision-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span className="card-eyebrow"> Admin Decision </span>
                  <h3>Seller Decision</h3>
                </div>
              </div>
              <p className="decision-description">
                Review all submitted information and documents before approving
                or rejecting this seller application.
              </p>
              <div className="decision-buttons">
                <button
                  type="button"
                  className="approve-btn"
                  disabled={showRejectBox || actionLoading}
                  onClick={handleApprove}
                >
                  <CheckCircle2 size={17} />
                  <span>
                    {isSubmitting ? "Processing..." : "Approve Seller"}
                  </span>
                </button>
                <button
                  type="button"
                  className="reject-btn"
                  disabled={showRejectBox || actionLoading}
                  onClick={() => setShowRejectBox(true)}
                >
                  <XCircle size={17} /> <span>Reject Seller</span>
                </button>
              </div>
              {/* Rejection Form */}
              {showRejectBox && (
                <form className="reject-form" onSubmit={handleRejectSubmit}>
                  <div className="reject-form-header">
                    <XCircle size={17} />
                    <div>
                      <h4>Reject Application</h4>
                      <p>
                        Provide a clear reason so the seller understands what
                        needs to be corrected.
                      </p>
                    </div>
                  </div>
                  <div className="reason-container">
                    <label htmlFor="rejectReason">Reason for rejection</label>
                    <textarea
                      id="rejectReason"
                      rows="4"
                      placeholder="Example: Business registration document is expired or the submitted address does not match the verification document."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCancelReject}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="confirm-reject-btn"
                      disabled={isSubmitting}
                    >
                      <XCircle size={15} />
                      <span>
                        {isSubmitting ? "Submitting..." : "Confirm Rejection"}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
          {/* Already Decided */}
          {normalizedStatus !== "pending" && (
            <section className="verification-card decision-result-card">
              <div className={`decision-result-icon ${normalizedStatus}`}>
                {normalizedStatus === "approved" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <XCircle size={22} />
                )}
              </div>
              <div>
                <span className="card-eyebrow">Verification Complete</span>
                <h3>
                  Application
                  {normalizedStatus === "approved" ? "Approved" : "Rejected"}
                </h3>
                <p>
                  This seller application has already received an administrative
                  decision.
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};
export default SellerVerification;
