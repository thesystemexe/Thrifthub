import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, Search, X, LoaderCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

import ProductCard from "../components/productCard/ProductCard";
import { searchProductsByImage } from "../features/products/productApi";
import { useDispatch, useSelector } from "react-redux";
import { userToggleFavorite } from "../features/products/productSlice";
import "../styles/visualSearch.css";

const VisualSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const imageFile = location.state?.imageFile;

  const [selectedFile, setSelectedFile] = useState(imageFile || null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const { favorites } = useSelector((store) => store.product);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be 3 MB or smaller.");
      return;
    }

    setSelectedFile(file);
    setResults([]);
    setSearched(false);
    setError("");
  };

  const handleSearch = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setSearched(false);

    try {
      const response = await searchProductsByImage(selectedFile, 12);
      setResults(response.results || []);
      setSearched(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Could not search for similar products. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = (productId) => {
    dispatch(userToggleFavorite(productId));
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResults([]);
    setSearched(false);
    setError("");
    navigate("/visual-search", { replace: true, state: null });
  };

  return (
    <main className="visual-search-page">
      <div className="visual-search-container">
        <button
          type="button"
          className="visual-search-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <header className="visual-search-heading">
          <span className="visual-search-eyebrow">
            <Camera size={15} />
            THRIFTHUB AI
          </span>

          <h1>Find it by image</h1>

          <p>
            Upload a photo of a piece you love. Our AI will find visually
            similar items in the ThriftHub catalogue.
          </p>
        </header>

        <section className="visual-search-upload">
          <input
            id="visual-search-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            hidden
          />

          {previewUrl ? (
            <div className="visual-search-preview">
              <img src={previewUrl} alt="Selected search" />

              <button
                type="button"
                className="visual-search-remove"
                onClick={handleReset}
                aria-label="Remove selected image"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="visual-search-file"
              className="visual-search-dropzone"
            >
              <span className="visual-search-camera-icon">
                <Camera size={28} />
              </span>

              <strong>Choose a clothing image</strong>

              <span>Click to upload JPEG, PNG, or WebP · Maximum 3 MB</span>
            </label>
          )}

          {previewUrl && (
            <button
              type="button"
              className="visual-search-change"
              onClick={() =>
                document.getElementById("visual-search-file")?.click()
              }
            >
              Choose another image
            </button>
          )}

          <button
            type="button"
            className="visual-search-submit"
            onClick={handleSearch}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="visual-search-spinner" size={18} />
                Finding similar pieces...
              </>
            ) : (
              <>
                <Search size={18} />
                Find similar products
              </>
            )}
          </button>

          {error && <p className="visual-search-error">{error}</p>}
        </section>

        {searched && (
          <section className="visual-search-results">
            <div className="visual-search-results-heading">
              <div>
                <span className="visual-search-eyebrow">YOUR RESULTS</span>
                <h2>
                  {results.length > 0
                    ? `${results.length} similar ${
                        results.length === 1 ? "piece" : "pieces"
                      } found`
                    : "No matching products found"}
                </h2>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="visual-search-grid">
                {results.map((item) => {
                  const product = item.product;

                  if (!product?._id) return null;

                  const isFavorite = favorites.some(
                    (favorite) => String(favorite._id) === String(product._id),
                  );

                  return (
                    <div key={product._id} className="visual-search-result">
                      <ProductCard
                        product={product}
                        isFavorite={isFavorite}
                        onToggleFavorite={handleFavorite}
                      />

                      <div className="visual-search-match">
                        <span>AI similarity</span>
                        <strong>{(item.similarity * 100).toFixed(1)}%</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="visual-search-empty">
                Try a different photo with the clothing item clearly visible.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default VisualSearch;
