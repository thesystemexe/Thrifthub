const ALLOWED_CATEGORIES = ["tops", "bottoms"];
const ALLOWED_FITS = ["slim", "regular", "oversized"];

const NUMERIC_FIELDS = [
  "body_chest_in",
  "body_shoulder_width_in",
  "body_waist_in",
  "body_inseam_in",
  "body_height_in",
  "garment_pit_to_pit_in",
  "garment_length_in",
  "garment_shoulder_width_in",
  "garment_sleeve_length_in",
  "garment_waist_in",
  "garment_inseam_in",
];

const predictGarmentFit = async (req, res) => {
  try {
    const { garment_category, preferred_fit, tag_size } = req.body || {};

    // Validate required fields.
    if (
      !ALLOWED_CATEGORIES.includes(garment_category) ||
      !ALLOWED_FITS.includes(preferred_fit) ||
      typeof tag_size !== "string" ||
      !tag_size.trim() ||
      tag_size.length > 20
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid garment category, preferred fit, or tag size.",
      });
    }

    // Validate optional measurements.
    for (const field of NUMERIC_FIELDS) {
      const value = req.body[field];

      if (value !== undefined && value !== null) {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value <= 0
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a positive number in inches.`,
          });
        }
      }
    }

    // Send only supported fields to the Python service.
    const payload = {
      garment_category,
      preferred_fit,
      tag_size: tag_size.trim(),
    };

    for (const field of NUMERIC_FIELDS) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    const pythonResponse = await fetch(
      "http://127.0.0.1:8000/fit-prediction/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      },
    );

    const result = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return res.status(pythonResponse.status === 422 ? 400 : 502).json({
        success: false,
        message: "The fit prediction service could not process the request.",
        details: result.detail || result.message || null,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Fit prediction controller error:", error);
    const timedOut = error.name === "TimeoutError";
    return res.status(timedOut ? 504 : 503).json({
      success: false,
      message: timedOut
        ? "Fit prediction service timed out."
        : "Fit prediction service is unavailable.",
    });
  }
};

module.exports = { predictGarmentFit };
