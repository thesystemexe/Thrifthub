import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  sellerUpdateProduct,
  sellerSingleProduct,
  removeErrors,
  removeSuccess,
} from "../../features/seller/sellerSlice";
import "./editProduct.css";
import { toast } from "react-toastify";

const EditProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams();

  const { product, isLoading, isSuccess, error, message } = useSelector(
    (state) => state.seller,
  );

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    genderCategory: "",
    brand: "",
    era: "",
    description: "",
    garmentType: "",
    primaryColor: "",
    colors: "",
    pattern: "unknown",
    styleTags: "",
    occasionTags: "",
    material: "",
    grade: "",
    madeInCountry: "",
    fabricComposition: "",
    tagSize: "",
    actualFitSize: "",
    pitToPit: "",
    length: "",
    shoulderWidth: "",
    sleeveLength: "",
    waist: "",
    inseam: "",
    price: "",
    stock: "",
  });

  const [flaws, setFlaws] = useState([""]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    dispatch(sellerSingleProduct(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product || String(product._id) !== String(productId)) return;

    setFormData({
      title: product.title || "",
      category: product.category || "",
      genderCategory: product.genderCategory || "",
      brand: product.brand || "",
      era: product.era || "",
      description: product.description || "",
      garmentType: product.garmentType || "other",
      primaryColor: product.primaryColor || "",
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
      pattern: product.pattern || "unknown",
      styleTags: Array.isArray(product.styleTags)
        ? product.styleTags.join(", ")
        : "",
      occasionTags: Array.isArray(product.occasionTags)
        ? product.occasionTags.join(", ")
        : "",
      material: product.material || "",
      grade: product.condition?.grade || "",
      madeInCountry: product.condition?.madeInCountry || "",
      fabricComposition: product.condition?.fabricComposition || "",
      tagSize: product.sizing?.tagSize || "",
      actualFitSize: product.sizing?.actualFitSize || "",
      pitToPit: product.sizing?.measurements?.pitToPit ?? "",
      length: product.sizing?.measurements?.length ?? "",
      shoulderWidth: product.sizing?.measurements?.shoulderWidth ?? "",
      sleeveLength: product.sizing?.measurements?.sleeveLength ?? "",
      waist: product.sizing?.measurements?.waist ?? "",
      inseam: product.sizing?.measurements?.inseam ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
    });

    setFlaws(product.condition?.flaws?.length ? product.condition.flaws : [""]);
    setExistingImages(product.images || []);
  }, [product, productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFlawChange = (index, value) => {
    setFlaws((prev) => prev.map((flaw, i) => (i === index ? value : flaw)));
  };

  const addFlaw = () => setFlaws((prev) => [...prev, ""]);

  const removeFlaw = (index) => {
    setFlaws((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + newImages.length + files.length;

    if (total > 3) {
      alert("You can have a maximum of 3 images in total.");
      e.target.value = "";
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totalImages = existingImages.length + newImages.length;

    if (totalImages === 0) {
      alert("Please keep or upload at least one product image.");
      return;
    }

    if (totalImages > 3) {
      alert("You can have a maximum of 3 images.");
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    data.append(
      "flaws",
      JSON.stringify(flaws.map((flaw) => flaw.trim()).filter(Boolean)),
    );

    data.append("existingImages", JSON.stringify(existingImages));

    newImages.forEach((image) => {
      data.append("images", image);
    });

    dispatch(
      sellerUpdateProduct({
        productId,
        productData: data,
      }),
    );
  };

  useEffect(() => {
    if (!isSuccess) return;

    toast.success(message || "Product updated successfully");

    const timer = setTimeout(() => {
      dispatch(removeSuccess());
      navigate("/seller/dashboard");
    }, 1800);

    return () => clearTimeout(timer);
  }, [isSuccess, message, dispatch, navigate]);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(removeErrors());
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  if (!product || String(product._id) !== String(productId)) {
    return (
      <main className="edit-product-page">
        <div className="edit-product-loading">
          <p>Product information not available.</p>
          <button type="button" onClick={() => navigate("/seller/products")}>
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-product-page">
      <div className="edit-product-container">
        <header className="edit-product-header">
          <div>
            <span className="edit-product-eyebrow">SELLER STUDIO</span>
            <h1 className="font-serif">Edit Product</h1>
            <p>Update your product information, condition and images.</p>
          </div>

          <button
            type="button"
            className="edit-back-btn"
            onClick={() => navigate("/seller/products")}
          >
            ← Products
          </button>
        </header>

        {error && <div className="edit-alert edit-alert-error">{error}</div>}

        {isSuccess && (
          <div className="edit-alert edit-alert-success">
            {message || "Product updated successfully"}
          </div>
        )}

        <form className="edit-product-form" onSubmit={handleSubmit}>
          {/* 01 — BASIC INFORMATION */}
          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span>01</span>
              <div>
                <h2>Basic Information</h2>
                <p>Update the main product details.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field edit-field-full">
                <label htmlFor="title">Product Title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-field">
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

              <div className="edit-field">
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
              </div>

              <div className="edit-field">
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

              <div className="edit-field">
                <label htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-field">
                <label htmlFor="era">Era</label>
                <input
                  id="era"
                  name="era"
                  value={formData.era}
                  onChange={handleChange}
                  placeholder="e.g. 90s"
                />
              </div>

              <div className="edit-field edit-field-full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="stock">Available Stock</label>
                <input
                  id="stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>
          </section>

          {/* 02 — STYLE AND OUTFIT DETAILS */}
          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span>02</span>
              <div>
                <h2>Style & Outfit Details</h2>
                <p>Update the product's recommendation metadata.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field">
                <label htmlFor="primaryColor">Primary Color</label>
                <input
                  id="primaryColor"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  placeholder="e.g. navy blue"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="colors">Other Colors</label>
                <input
                  id="colors"
                  name="colors"
                  value={formData.colors}
                  onChange={handleChange}
                  placeholder="e.g. white, cream, red"
                />
                <small>Separate colors with commas.</small>
              </div>

              <div className="edit-field">
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

              <div className="edit-field">
                <label htmlFor="material">Material</label>
                <input
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="e.g. denim, cotton, wool"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="styleTags">Style Tags</label>
                <input
                  id="styleTags"
                  name="styleTags"
                  value={formData.styleTags}
                  onChange={handleChange}
                  placeholder="e.g. streetwear, vintage, minimal"
                />
                <small>Separate tags with commas.</small>
              </div>

              <div className="edit-field">
                <label htmlFor="occasionTags">Occasion Tags</label>
                <input
                  id="occasionTags"
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
          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span>03</span>
              <div>
                <h2>Condition</h2>
                <p>Update condition details and visible flaws.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field">
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

              <div className="edit-field">
                <label htmlFor="madeInCountry">Made In Country</label>
                <input
                  id="madeInCountry"
                  name="madeInCountry"
                  value={formData.madeInCountry}
                  onChange={handleChange}
                  placeholder="e.g. USA"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="fabricComposition">Fabric Composition</label>
                <input
                  id="fabricComposition"
                  name="fabricComposition"
                  value={formData.fabricComposition}
                  onChange={handleChange}
                  placeholder="e.g. 100% Cotton"
                />
              </div>

              <div className="edit-field edit-field-full">
                <div className="edit-flaws-label">
                  <div>
                    <label>Visible Flaws</label>
                    <small>Add any stains, holes, fading, or damage.</small>
                  </div>
                  <button
                    type="button"
                    className="edit-add-flaw-btn"
                    onClick={addFlaw}
                  >
                    + Add flaw
                  </button>
                </div>

                <div className="edit-flaws-list">
                  {flaws.map((flaw, index) => (
                    <div className="edit-flaw-row" key={index}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <input
                        value={flaw}
                        onChange={(e) =>
                          handleFlawChange(index, e.target.value)
                        }
                        placeholder="Describe a flaw, if any"
                        aria-label={`Flaw ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="edit-remove-flaw-btn"
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
          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span>04</span>
              <div>
                <h2>Sizing & Measurements</h2>
                <p>Update the garment's tagged size and measurements.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field">
                <label htmlFor="tagSize">Tag Size</label>
                <input
                  id="tagSize"
                  name="tagSize"
                  value={formData.tagSize}
                  onChange={handleChange}
                  placeholder="e.g. M, L, W32 L30"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="actualFitSize">Actual Fit Size</label>
                <input
                  id="actualFitSize"
                  name="actualFitSize"
                  value={formData.actualFitSize}
                  onChange={handleChange}
                  placeholder="e.g. Fits like M"
                />
              </div>

              {[
                ["pitToPit", "Pit to Pit (inches)"],
                ["length", "Length (inches)"],
                ["shoulderWidth", "Shoulder Width (inches)"],
                ["sleeveLength", "Sleeve Length (inches)"],
                ["waist", "Waist (inches)"],
                ["inseam", "Inseam (inches)"],
              ].map(([name, label]) => (
                <div className="edit-field" key={name}>
                  <label htmlFor={name}>{label}</label>
                  <input
                    id={name}
                    type="number"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 05 — IMAGES */}
          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span>05</span>
              <div>
                <h2>Product Images</h2>
                <p>Keep existing images or add new ones. Maximum 3 total.</p>
              </div>
            </div>

            <div className="edit-image-subsection">
              <div className="edit-image-subheading">
                <h3>Current Images</h3>
                <span>{existingImages.length} / 3</span>
              </div>

              {existingImages.length ? (
                <div className="edit-image-grid">
                  {existingImages.map((image, index) => (
                    <div
                      className="edit-image-card"
                      key={image.publicId || image.url || index}
                    >
                      <img
                        src={image.url}
                        alt={`Current product ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="edit-image-remove"
                        onClick={() => removeExistingImage(index)}
                        aria-label={`Remove current image ${index + 1}`}
                      >
                        ×
                      </button>
                      <span className="edit-image-label">Existing</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="edit-no-images">No existing images.</div>
              )}
            </div>

            {existingImages.length + newImages.length < 3 && (
              <div className="edit-image-subsection">
                <div className="edit-image-subheading">
                  <h3>Add New Images</h3>
                  <span>
                    {3 - existingImages.length - newImages.length} slots left
                  </span>
                </div>

                <div className="edit-image-upload">
                  <input
                    id="new-product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImages}
                  />
                  <label htmlFor="new-product-images">
                    <span className="edit-upload-icon">+</span>
                    <strong>Choose New Images</strong>
                    <small>PNG, JPG or WEBP</small>
                  </label>
                </div>
              </div>
            )}

            {newImages.length > 0 && (
              <div className="edit-image-subsection">
                <div className="edit-image-subheading">
                  <h3>New Image Preview</h3>
                  <span>{newImages.length}</span>
                </div>

                <div className="edit-image-grid">
                  {newImages.map((image, index) => (
                    <div
                      className="edit-image-card edit-new-image"
                      key={`${image.name}-${index}`}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New product ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="edit-image-remove"
                        onClick={() => removeNewImage(index)}
                        aria-label={`Remove new image ${index + 1}`}
                      >
                        ×
                      </button>
                      <span className="edit-image-label edit-new-label">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 06 — PRICING */}
          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span>06</span>
              <div>
                <h2>Pricing</h2>
                <p>Update the selling price.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field edit-price-field">
                <label htmlFor="price">Price (₹)</label>
                <div className="edit-price-input">
                  <span>₹</span>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* FORM ACTIONS */}
          <div className="edit-form-actions">
            <button
              type="button"
              className="edit-cancel-btn"
              onClick={() => navigate("/seller/products")}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditProduct;
