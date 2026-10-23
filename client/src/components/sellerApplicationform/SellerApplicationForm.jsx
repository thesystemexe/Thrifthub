import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitSellerApplicationForm } from "../../features/seller/sellerSlice";
import "./sellerApplicationForm.css";
import { assets } from "../../assets/assets";

// Ensure you import your assets object here (e.g., import { assets } from "../../assets/assets";)

const SellerApplicationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isSubmitting, error } = useSelector((state) => state.seller);

  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    docType: "ID_Card", // Default selected docType
  });

  const [files, setFiles] = useState({
    ID_Card: null,
    Business_License: null,
    Tax_Doc: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: targetFiles } = e.target;
    if (targetFiles && targetFiles[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: targetFiles[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // 1. Text Inputs (Appended FIRST for Multer parsing order)
    data.append("storeName", formData.storeName);
    data.append("storeDescription", formData.storeDescription);
    data.append("phone", formData.phone);
    data.append("street", formData.street);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("zipCode", formData.zipCode);
    data.append("docType", formData.docType);

    console.log(data);

    // 2. File Inputs (Appended LAST under key name "documents" to match req.files.documents)
    const selectedFile =
      files.ID_Card || files.Business_License || files.Tax_Doc;

    if (selectedFile) {
      data.append("documents", selectedFile);
    }

    try {
      await dispatch(submitSellerApplicationForm(data)).unwrap();
      navigate("/");
    } catch (err) {
      console.error("Seller registration error:", err);
    }
  };

  return (
    <div className="seller-page">
      <header className="reset-top-header">
        <Link to="#" className="brand-logo-link">
          {/* Fallback image handle if assets is loaded dynamically */}
          <img
            src={assets?.brand_logo}
            alt="ThriftHub Logo"
            className="brand-logo"
          />
          <span className="brand-name">ThriftHub</span>
        </Link>
      </header>

      <form className="seller-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>Become a Seller on ThriftHub</h2>
          <p>
            Fill in your business details and upload verification documents to
            set up shop.
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* 2-Column Split Wrapper */}
        <div className="form-columns">
          {/* --- LEFT COLUMN: Store & Address Info --- */}
          <div className="form-column-left">
            <div className="form-section">
              <h3>Store Information</h3>

              <div className="input-group">
                <label className="input-group-label">Store Name *</label>
                <input
                  type="text"
                  name="storeName"
                  placeholder="e.g. Retro Vibe Vintage"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-group-label">Store Description *</label>
                <textarea
                  rows="3"
                  name="storeDescription"
                  placeholder="Describe what pre-loved or thrift items you sell..."
                  value={formData.storeDescription}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-group-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Business Address</h3>

              <div className="input-group">
                <label className="input-group-label">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  placeholder="House/Shop No., Street, Area"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-group-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Jaipur"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-group-label">State *</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Rajasthan"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-group-label">Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="302001"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Documents & Submit --- */}
          <div className="form-column-right">
            <div className="form-section">
              <h3>Verification Documents</h3>
              <p className="section-hint">
                Select document category and attach file for verification.
              </p>

              <div className="input-group">
                <label className="input-group-label">Document Category *</label>
                <select
                  name="docType"
                  value={formData.docType}
                  onChange={handleChange}
                  className="doc-type-select"
                >
                  <option value="ID_Card">Government ID Card</option>
                  <option value="Business_License">Business License</option>
                  <option value="Tax_Doc">Tax Document / GST</option>
                </select>
              </div>

              {formData.docType === "ID_Card" && (
                <div className="input-group">
                  <label className="input-group-label">
                    Government ID Card File *
                  </label>
                  <input
                    type="file"
                    name="ID_Card"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                  {files.ID_Card && (
                    <span className="file-name">
                      Selected: {files.ID_Card.name}
                    </span>
                  )}
                </div>
              )}

              {formData.docType === "Business_License" && (
                <div className="input-group">
                  <label className="input-group-label">
                    Business License File *
                  </label>
                  <input
                    type="file"
                    name="Business_License"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                  {files.Business_License && (
                    <span className="file-name">
                      Selected: {files.Business_License.name}
                    </span>
                  )}
                </div>
              )}

              {formData.docType === "Tax_Doc" && (
                <div className="input-group">
                  <label className="input-group-label">
                    Tax Document File *
                  </label>
                  <input
                    type="file"
                    name="Tax_Doc"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                  {files.Tax_Doc && (
                    <span className="file-name">
                      Selected: {files.Tax_Doc.name}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting Application..."
                : "Submit Seller Application"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellerApplicationForm;
