// utils/productMetadata.js

const GARMENT_TYPES = [
  "tshirt",
  "shirt",
  "blouse",
  "sweater",
  "cardigan",
  "hoodie",
  "jacket",
  "coat",
  "jeans",
  "trousers",
  "shorts",
  "skirt",
  "dress",
  "jumpsuit",
  "vest",
  "tank_top",
  "other",
];

const toNullableNumber = (value, fieldName) => {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Invalid ${fieldName} measurement`);
  }

  return number;
};

const parseStringArray = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  let values = value;

  if (typeof value === "string") {
    try {
      values = JSON.parse(value);
    } catch {
      // Also accept comma-separated form values.
      values = value.split(",");
    }
  }

  if (!Array.isArray(values)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return values
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const normalizeGarmentType = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Garment type is required");
  }

  const garmentType = value.trim().toLowerCase();

  if (!GARMENT_TYPES.includes(garmentType)) {
    throw new Error(`Unsupported garment type: ${garmentType}`);
  }

  return garmentType;
};

module.exports = {
  GARMENT_TYPES,
  toNullableNumber,
  parseStringArray,
  normalizeGarmentType,
};
