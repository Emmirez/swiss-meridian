// Shared country / ID / address rules used by Register and JointSignup.
// Keep in sync with validateAddressAndId() in backend/controllers/authController.js
import { countries } from "./countries";

export const countryOptions = countries.map((c) => ({ value: c, label: c }));

// Which ID number to ask for, by country
export const getIdConfig = (country) => {
  if (country === "United States")
    return {
      label: "Social Security Number (9 digits)",
      short: "SSN",
      digitsOnly: true,
      note: "Your SSN is encrypted and only used to verify your identity, as required for US bank accounts.",
    };
  if (country === "Canada")
    return {
      label: "Social Insurance Number (9 digits)",
      short: "SIN",
      digitsOnly: true,
      note: "Your SIN is encrypted and only used to verify your identity.",
    };
  return {
    label: "National ID / Tax ID number",
    short: "ID number",
    digitsOnly: false,
    note: "Your ID number is encrypted and only used to verify your identity.",
  };
};

// Labels for state/postal fields, and whether they're required
export const getRegionConfig = (country) => {
  if (country === "United States")
    return { region: "State", postal: "ZIP code", required: true };
  if (country === "Canada")
    return { region: "Province", postal: "Postal code", required: true };
  return {
    region: "State / Region (optional)",
    postal: "Postal code (optional)",
    required: false,
  };
};

// Cleans what the user types into the ID field
export const cleanIdInput = (value, idConfig) =>
  idConfig.digitsOnly
    ? value.replace(/\D/g, "").slice(0, 9)
    : value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 20);

// Returns an error message, or "" if the ID + address are valid
export const validateAddressAndId = (form) => {
  if (!form.country) return "Please select your country";
  const idConfig = getIdConfig(form.country);
  if (idConfig.digitsOnly) {
    if (!/^\d{9}$/.test(form.ssn))
      return `${idConfig.short} must be exactly 9 digits`;
  } else if (!/^[A-Z0-9]{4,20}$/.test(form.ssn)) {
    return "ID number must be 4–20 letters or numbers";
  }
  if (!form.street || !form.city) return "Please complete your address";
  if (getRegionConfig(form.country).required && (!form.state || !form.zip))
    return "Please complete your address";
  return "";
};