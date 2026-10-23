import React, { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  userUpdateCartQuantity,
  userRemoveFromCart,
  removeError,
  removeMessage,
} from "../features/cart/cartSlice";

const CartItem = ({ item }) => {
  const { isSuccess, message, actionLoading, removingId, error } = useSelector(
    (store) => store.cart,
  );

  const dispatch = useDispatch();

  const product = item.product;

  const [quantity, setQuantity] = useState(item.quantity);

  // Keep local quantity synced with Redux/backend
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  // ==========================================================
  // Increase quantity
  // ==========================================================

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((previousQuantity) => previousQuantity + 1);
    }
  };

  // ==========================================================
  // Decrease quantity
  // ==========================================================

  const decreaseQuantity = () => {
    setQuantity((previousQuantity) => Math.max(1, previousQuantity - 1));
  };

  // ==========================================================
  // Update quantity in MongoDB
  // ==========================================================

  const handleUpdate = () => {
    if (actionLoading) return;

    if (quantity !== item.quantity) {
      dispatch(
        userUpdateCartQuantity({
          productId: product._id,
          quantity,
        }),
      );
    }
  };

  // ==========================================================
  // Remove item from MongoDB cart
  // ==========================================================

  const handleRemove = () => {
    if (actionLoading) return;

    dispatch(userRemoveFromCart(product._id));
  };

  // ==========================================================
  // Error toast
  // ==========================================================

  useEffect(() => {
    if (error) {
      toast.error(error || "Something went wrong");

      dispatch(removeError());
    }
  }, [dispatch, error]);

  // ==========================================================
  // Success toast
  // ==========================================================

  useEffect(() => {
    if (isSuccess && message) {
      toast.success(message, {
        toastId: "cart-update",
      });

      dispatch(removeMessage());
    }
  }, [dispatch, isSuccess, message]);

  return (
    <article className="th-item-card">
      {/* ====================================================
          PRODUCT IMAGE
      ==================================================== */}

      <div className="th-item-img-box">
        <img
          src={product?.images?.[0]?.url || ""}
          alt={product?.title || "Product"}
          className="th-item-img"
        />
      </div>

      {/* ====================================================
          PRODUCT INFORMATION
      ==================================================== */}

      <div className="th-item-body">
        <div className="th-item-topbar">
          <span className="th-curator-tag">Added to your cart</span>

          <span className="th-item-sku">#{product?._id}</span>
        </div>

        {/* PRODUCT TITLE + PRICE */}

        <div className="th-item-title-row">
          <h2 className="th-item-title">{product?.title}</h2>

          <div className="th-item-price-box">
            <span className="th-item-price">
              ₹{Number(product?.price || 0).toFixed(2)}
            </span>

            <span className="th-item-retail">per item</span>
          </div>
        </div>

        {/* ==================================================
            PRODUCT DETAILS
        ================================================== */}

        <div className="th-item-chips">
          <span className="th-chip th-chip-grade">
            In Stock: {product?.stock || 0}
          </span>

          <span className="th-chip th-chip-tag">Quantity: {item.quantity}</span>
        </div>

        {/* ==================================================
            QUANTITY CONTROLS
        ================================================== */}

        <div className="th-cart-quantity-box">
          <span className="th-quantity-label">Quantity</span>

          <div className="th-quantity-controls">
            <button
              type="button"
              className="th-quantity-btn"
              disabled={actionLoading || quantity <= 1}
              onClick={decreaseQuantity}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <span className="th-quantity-value">{quantity}</span>

            <button
              type="button"
              className="th-quantity-btn"
              disabled={actionLoading || quantity >= product.stock}
              onClick={increaseQuantity}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* ==================================================
            ITEM TOTAL
        ================================================== */}

        <div className="th-item-total-row">
          <div>
            <span className="th-item-total-label">Item Total</span>

            <strong className="th-item-total-price">
              ₹ {(Number(product?.price || 0) * item.quantity).toFixed(2)}
            </strong>
          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="th-btn-actions">
            <button
              type="button"
              className="th-action-btn th-update-btn"
              disabled={actionLoading || quantity === item.quantity}
              onClick={handleUpdate}
            >
              {actionLoading ? "Updating..." : "Update"}
            </button>

            <button
              type="button"
              className="th-action-btn th-action-remove"
              disabled={actionLoading && removingId === product._id}
              onClick={handleRemove}
            >
              <Trash2 size={14} />

              {actionLoading && removingId === product._id
                ? "Removing..."
                : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
