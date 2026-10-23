import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Ruler, CheckCircle2 } from "lucide-react";
import "../styles/fitFeedbackForm.css";
import { submitFitFeedback } from "../features/order/orderApi";

const FitFeedbackForm = ({ orderId, item, onSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [fitOutcome, setFitOutcome] = useState("");
  const [chest, setChest] = useState("");
  const [shoulderWidth, setShoulderWidth] = useState("");
  const [height, setHeight] = useState("");
  const [preferredFit, setPreferredFit] = useState("regular");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isDelivered =
    item?.orderStatus?.toLowerCase() === "delivered" &&
    Boolean(item?.deliveredAt);

  if (!isDelivered) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fitOutcome) {
      toast.error("Please select how the item fits.");
      return;
    }

    const payload = {
      fitOutcome,
      preferredFit,
      consentToUseForTraining: consent,
    };

    // Body measurements are optional.
    if (chest !== "") {
      payload.chest = Number(chest);
    }

    if (shoulderWidth !== "") {
      payload.shoulderWidth = Number(shoulderWidth);
    }

    if (height !== "") {
      payload.height = Number(height);
    }

    try {
      setSubmitting(true);
      const response = await submitFitFeedback(orderId, item._id, payload);
      setSubmitted(true);
      setOpen(false);
      toast.success(
        response.message || "Thanks! Your fit feedback was submitted.",
      );
      onSubmitted?.(item._id);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Could not submit feedback. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="th-fit-feedback-success">
        <CheckCircle2 size={17} />
        <span>Fit feedback submitted</span>
      </div>
    );
  }

  return (
    <section className="th-fit-feedback">
      <div className="th-fit-feedback-heading">
        <div className="th-fit-feedback-icon">
          <Ruler size={18} />
        </div>

        <div>
          <h4>How did this item fit?</h4>
          <p>Help us improve ThriftHub size recommendations.</p>
        </div>
      </div>

      {!open ? (
        <button
          type="button"
          className="th-fit-feedback-open"
          onClick={() => setOpen(true)}
        >
          Share fit feedback
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="th-fit-feedback-form">
          <fieldset>
            <legend>Your fit experience *</legend>

            <div className="th-fit-options">
              {[
                ["too_tight", "Too tight"],
                ["fits_well", "Fits well"],
                ["too_loose", "Too loose"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={`th-fit-option ${
                    fitOutcome === value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`fit-${item._id}`}
                    value={value}
                    checked={fitOutcome === value}
                    onChange={(event) => setFitOutcome(event.target.value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="th-fit-field">
            <label htmlFor={`preferred-${item._id}`}>Your preferred fit</label>
            <select
              id={`preferred-${item._id}`}
              value={preferredFit}
              onChange={(event) => setPreferredFit(event.target.value)}
            >
              <option value="slim">Slim</option>
              <option value="regular">Regular</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>

          <p className="th-fit-measurement-note">
            Optional body measurements in inches. You can submit feedback
            without sharing measurements.
          </p>

          <div className="th-fit-measurement-grid">
            <div className="th-fit-field">
              <label htmlFor={`chest-${item._id}`}>Chest circumference</label>
              <input
                id={`chest-${item._id}`}
                type="number"
                min="1"
                max="100"
                step="0.1"
                value={chest}
                onChange={(event) => setChest(event.target.value)}
                placeholder="e.g. 38"
              />
            </div>

            <div className="th-fit-field">
              <label htmlFor={`shoulder-${item._id}`}>Shoulder width</label>
              <input
                id={`shoulder-${item._id}`}
                type="number"
                min="1"
                max="40"
                step="0.1"
                value={shoulderWidth}
                onChange={(event) => setShoulderWidth(event.target.value)}
                placeholder="e.g. 17"
              />
            </div>

            <div className="th-fit-field">
              <label htmlFor={`height-${item._id}`}>Height</label>
              <input
                id={`height-${item._id}`}
                type="number"
                min="1"
                max="100"
                step="0.1"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <label className="th-fit-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              I voluntarily agree to let ThriftHub use my fit feedback and
              submitted measurements to improve its size recommendation model.
              This is optional and unchecked by default.
            </span>
          </label>

          <div className="th-fit-feedback-actions">
            <button
              type="button"
              className="th-fit-cancel"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="th-fit-submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default FitFeedbackForm;
