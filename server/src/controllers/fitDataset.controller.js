const fitFeedbackModel = require("../models/fitFeedback.model");
const handleAsyncError = require("../middlewares/handleAsyncError");

const csvCell = (value) => {
  let text = value == null ? "" : String(value);

  // Prevent spreadsheet formula injection.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

const exportFitDatasetController = handleAsyncError(async (req, res) => {
  // Only explicitly consented feedback can enter this dataset.
  const records = await fitFeedbackModel
    .find({ consentToUseForTraining: true })
    .select(
      "fitOutcome bodyMeasurements preferredFit garmentMeasurements createdAt",
    )
    .lean();

  const columns = [
    "body_chest_in",
    "body_shoulder_width_in",
    "body_height_in",
    "preferred_fit",
    "garment_pit_to_pit_in",
    "garment_length_in",
    "garment_shoulder_width_in",
    "garment_sleeve_length_in",
    "garment_waist_in",
    "garment_inseam_in",
    "garment_tag_size",
    "fabric_composition",
    "fit_outcome",
  ];

  const rows = records.map((record) => {
    const body = record.bodyMeasurements || {};
    const garment = record.garmentMeasurements || {};

    return [
      body.chest,
      body.shoulderWidth,
      body.height,
      record.preferredFit,
      garment.pitToPit,
      garment.length,
      garment.shoulderWidth,
      garment.sleeveLength,
      garment.waist,
      garment.inseam,
      garment.tagSize,
      garment.fabricComposition,
      record.fitOutcome,
    ];
  });

  const csv = [
    columns.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="thrifthub-fit-training-data.csv"',
  );
  res.setHeader("Cache-Control", "no-store");

  return res.status(200).send(csv);
});

module.exports = { exportFitDatasetController };
