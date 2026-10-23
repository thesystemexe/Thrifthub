import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  sellerCreateProduct,
  removeErrors,
  removeSuccess,
} from "../../features/seller/sellerSlice";

import "./createProduct.css";
import Header from "../../components/header/Header";

const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isSuccess, error, message } = useSelector(
    (state) => state.seller,
  );

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    genderCategory: "",
    brand: "",
    era: "",
    description: "",

    // Garment classification and outfit recommendation metadata
    garmentType: "",
    primaryColor: "",
    colors: "",
    pattern: "unknown",
    styleTags: "",
    occasionTags: "",
    material: "",

    // Condition
    grade: "",
    madeInCountry: "",
    fabricComposition: "",

    // Sizing
    tagSize: "",
    actualFitSize: "",
    pitToPit: "",
    length: "",
    shoulderWidth: "",
    sleeveLength: "",
    waist: "",
    inseam: "",

    // Pricing
    price: "",
    stock: "",
  });

  const [flaws, setFlaws] = useState([""]);
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFlawChange = (index, value) => {
    setFlaws((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addFlaw = () => {
    setFlaws((prev) => [...prev, ""]);
  };

  const removeFlaw = (index) => {
    setFlaws((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      alert("You can upload maximum 3 images.");
      e.target.value = "";
      return;
    }

    setImages(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    const cleanedFlaws = flaws.map((flaw) => flaw.trim()).filter(Boolean);

    data.append("flaws", JSON.stringify(cleanedFlaws));

    images.forEach((image) => {
      data.append("images", image);
    });

    dispatch(sellerCreateProduct(data));
  };

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      dispatch(removeSuccess());
      navigate("/seller/dashboard");
    }, 1800);

    return () => clearTimeout(timer);
  }, [isSuccess, dispatch, navigate]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      dispatch(removeErrors());
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  return (
    <>
      <Header />

      <main className="create-product-page">
        <div className="create-product-container">
          <header className="create-product-header">
            <div>
              <span className="create-product-eyebrow">SELLER STUDIO</span>

              <h1 className="font-serif">Create Product</h1>

              <p>Add a new piece to your ThriftHub collection.</p>
            </div>

            <button
              type="button"
              className="create-back-btn"
              onClick={() => navigate("/seller/dashboard")}
            >
              ← Dashboard
            </button>
          </header>

          {error && (
            <div className="create-alert create-alert-error">{error}</div>
          )}

          {isSuccess && (
            <div className="create-alert create-alert-success">
              {message || "Product uploaded successfully"}
            </div>
          )}

          <form className="create-product-form" onSubmit={handleSubmit}>
            {/* 01 — BASIC INFORMATION */}

            <section className="create-form-section">
              <div className="create-section-heading">
                <span>01</span>

                <div>
                  <h2>Basic Information</h2>
                  <p>Tell buyers about your item.</p>
                </div>
              </div>

              <div className="create-form-grid">
                <div className="create-field create-field-full">
                  <label htmlFor="title">Product Title</label>

                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Vintage 90s Levi's 501 Denim Jeans"
                    required
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="category">Category</label>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Sweaters">Sweaters</option>
                  </select>
                </div>

                <div className="create-field">
                  <label htmlFor="garmentType">Garment Type</label>

                  <select
                    id="garmentType"
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select garment type</option>
                    <option value="tshirt">T-shirt</option>
                    <option value="shirt">Shirt</option>
                    <option value="blouse">Blouse</option>
                    <option value="tank_top">Tank top</option>
                    <option value="sweater">Sweater</option>
                    <option value="cardigan">Cardigan</option>
                    <option value="hoodie">Hoodie</option>
                    <option value="jacket">Jacket</option>
                    <option value="coat">Coat</option>
                    <option value="jeans">Jeans</option>
                    <option value="trousers">Trousers</option>
                    <option value="shorts">Shorts</option>
                    <option value="skirt">Skirt</option>
                    <option value="dress">Dress</option>
                    <option value="jumpsuit">Jumpsuit</option>
                    <option value="vest">Vest</option>
                    <option value="other">Other</option>
                  </select>

                  <small>
                    Choose the specific garment, separate from its broad
                    category.
                  </small>
                </div>

                <div className="create-field">
                  <label htmlFor="genderCategory">Gender Category</label>

                  <select
                    id="genderCategory"
                    name="genderCategory"
                    value={formData.genderCategory}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div className="create-field">
                  <label htmlFor="brand">Brand</label>

                  <input
                    id="brand"
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Levi's"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="era">Era</label>

                  <input
                    id="era"
                    type="text"
                    name="era"
                    value={formData.era}
                    onChange={handleChange}
                    placeholder="90s"
                  />
                </div>

                <div className="create-field create-field-full">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the product, its style and condition..."
                    rows="5"
                    required
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="stock">Available Stock</label>

                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="1"
                    min="1"
                    step="1"
                    required
                  />

                  <small>
                    Enter the number of identical items available for sale.
                  </small>
                </div>
              </div>
            </section>

            {/* 02 — STYLE AND OUTFIT DETAILS */}

            <section className="create-form-section">
              <div className="create-section-heading">
                <span>02</span>

                <div>
                  <h2>Style & Outfit Details</h2>
                  <p>Add visual details to improve outfit recommendations.</p>
                </div>
              </div>

              <div className="create-form-grid">
                <div className="create-field">
                  <label htmlFor="primaryColor">Primary Color</label>

                  <input
                    id="primaryColor"
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    placeholder="e.g. navy blue"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="colors">Other Colors</label>

                  <input
                    id="colors"
                    type="text"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                    placeholder="e.g. white, cream, red"
                  />

                  <small>Separate colors with commas.</small>
                </div>

                <div className="create-field">
                  <label htmlFor="pattern">Pattern</label>

                  <select
                    id="pattern"
                    name="pattern"
                    value={formData.pattern}
                    onChange={handleChange}
                  >
                    <option value="unknown">Unknown / not specified</option>
                    <option value="solid">Solid</option>
                    <option value="striped">Striped</option>
                    <option value="plaid">Plaid / Checkered</option>
                    <option value="floral">Floral</option>
                    <option value="graphic">Graphic / Printed</option>
                    <option value="logo">Logo</option>
                    <option value="camouflage">Camouflage</option>
                    <option value="geometric">Geometric</option>
                    <option value="abstract">Abstract</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="create-field">
                  <label htmlFor="material">Material</label>

                  <input
                    id="material"
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    placeholder="e.g. denim, cotton, wool"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="styleTags">Style Tags</label>

                  <input
                    id="styleTags"
                    type="text"
                    name="styleTags"
                    value={formData.styleTags}
                    onChange={handleChange}
                    placeholder="e.g. streetwear, vintage, minimal"
                  />

                  <small>Separate tags with commas.</small>
                </div>

                <div className="create-field">
                  <label htmlFor="occasionTags">Occasion Tags</label>

                  <input
                    id="occasionTags"
                    type="text"
                    name="occasionTags"
                    value={formData.occasionTags}
                    onChange={handleChange}
                    placeholder="e.g. casual, party, everyday"
                  />

                  <small>Separate tags with commas.</small>
                </div>
              </div>
            </section>

            {/* 03 — CONDITION */}

            <section className="create-form-section">
              <div className="create-section-heading">
                <span>03</span>

                <div>
                  <h2>Condition</h2>
                  <p>Be transparent about the item's condition.</p>
                </div>
              </div>

              <div className="create-form-grid">
                <div className="create-field">
                  <label htmlFor="grade">Condition Grade</label>

                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select grade</option>
                    <option value="A">Excellent (A)</option>
                    <option value="B">Good (B)</option>
                    <option value="C">Fair (C)</option>
                  </select>
                </div>

                <div className="create-field">
                  <label htmlFor="madeInCountry">Made In Country</label>

                  <input
                    id="madeInCountry"
                    type="text"
                    name="madeInCountry"
                    value={formData.madeInCountry}
                    onChange={handleChange}
                    placeholder="e.g. USA"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="fabricComposition">Fabric Composition</label>

                  <input
                    id="fabricComposition"
                    type="text"
                    name="fabricComposition"
                    value={formData.fabricComposition}
                    onChange={handleChange}
                    placeholder="e.g. 100% Cotton"
                  />
                </div>

                <div className="create-field create-field-full">
                  <div className="create-flaws-label">
                    <div>
                      <label>Visible Flaws</label>
                      <span>Add any stains, holes, fading, or damage.</span>
                    </div>

                    <button
                      type="button"
                      className="add-flaw-btn"
                      onClick={addFlaw}
                    >
                      + Add flaw
                    </button>
                  </div>

                  <div className="flaws-list">
                    {flaws.map((flaw, index) => (
                      <div className="flaw-row" key={index}>
                        <span className="flaw-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <input
                          type="text"
                          value={flaw}
                          onChange={(e) =>
                            handleFlawChange(index, e.target.value)
                          }
                          placeholder="Describe a flaw, if any"
                          aria-label={`Flaw ${index + 1}`}
                        />

                        <button
                          type="button"
                          className="remove-flaw-btn"
                          onClick={() => removeFlaw(index)}
                          aria-label={`Remove flaw ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 04 — SIZING AND MEASUREMENTS */}

            <section className="create-form-section">
              <div className="create-section-heading">
                <span>04</span>

                <div>
                  <h2>Sizing & Measurements</h2>
                  <p>
                    Add the tagged size and actual garment measurements in
                    inches.
                  </p>
                </div>
              </div>

              <div className="create-form-grid">
                <div className="create-field">
                  <label htmlFor="tagSize">Tag Size</label>

                  <input
                    id="tagSize"
                    type="text"
                    name="tagSize"
                    value={formData.tagSize}
                    onChange={handleChange}
                    placeholder="e.g. M, L, W32 L30"
                    required
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="actualFitSize">Actual Fit Size</label>

                  <input
                    id="actualFitSize"
                    type="text"
                    name="actualFitSize"
                    value={formData.actualFitSize}
                    onChange={handleChange}
                    placeholder="e.g. Fits like M"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="pitToPit">Pit to Pit (inches)</label>

                  <input
                    id="pitToPit"
                    type="number"
                    name="pitToPit"
                    value={formData.pitToPit}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g. 22"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="length">Length (inches)</label>

                  <input
                    id="length"
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g. 28"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="shoulderWidth">Shoulder Width (inches)</label>

                  <input
                    id="shoulderWidth"
                    type="number"
                    name="shoulderWidth"
                    value={formData.shoulderWidth}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g. 18"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="sleeveLength">Sleeve Length (inches)</label>

                  <input
                    id="sleeveLength"
                    type="number"
                    name="sleeveLength"
                    value={formData.sleeveLength}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g. 24"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="waist">Waist (inches)</label>

                  <input
                    id="waist"
                    type="number"
                    name="waist"
                    value={formData.waist}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g. 32"
                  />
                </div>

                <div className="create-field">
                  <label htmlFor="inseam">Inseam (inches)</label>

                  <input
                    id="inseam"
                    type="number"
                    name="inseam"
                    value={formData.inseam}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>
            </section>

            {/* 05 — PRODUCT IMAGES */}

            <section className="create-form-section">
              <div className="create-section-heading">
                <span>05</span>

                <div>
                  <h2>Product Images</h2>
                  <p>Upload clear images of the front, back, and details.</p>
                </div>
              </div>

              <div className="image-upload-box">
                <input
                  id="productImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />

                <label htmlFor="productImages">
                  <span className="upload-icon">＋</span>
                  <strong>Choose product images</strong>
                  <small>Upload up to 3 images.</small>
                </label>
              </div>

              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((image, index) => (
                    <div
                      className="image-preview"
                      key={`${image.name}-${index}`}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product preview ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 06 — PRICE */}

            <section className="create-form-section">
              <div className="create-section-heading">
                <span>06</span>

                <div>
                  <h2>Pricing</h2>
                  <p>Set the selling price for your product.</p>
                </div>
              </div>

              <div className="create-form-grid">
                <div className="create-field price-field">
                  <label htmlFor="price">Price (₹)</label>

                  <div className="price-input">
                    <span>₹</span>

                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* FORM ACTIONS */}

            <div className="create-form-actions">
              <button
                type="button"
                className="create-cancel-btn"
                onClick={() => navigate("/seller/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Creating Product..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateProduct;
