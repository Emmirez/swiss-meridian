// Generates realistic-looking (but not real, functioning) card numbers
// following each network's real numbering convention for portfolio realism.
const randomDigits = (count) => {
  let out = "";
  for (let i = 0; i < count; i++) out += Math.floor(Math.random() * 10);
  return out;
};

export const generateCardNumber = (network = "visa") => {
  switch (network) {
    case "mastercard":
      // Mastercard ranges start 51-55 (or 2221-2720) — 16 digits total
      return `5${Math.floor(1 + Math.random() * 5)}${randomDigits(14)}`;
    case "amex":
      // Amex starts 34 or 37 — 15 digits total
      return `3${Math.random() < 0.5 ? "4" : "7"}${randomDigits(13)}`;
    case "verve":
      // Verve (common in Nigerian banking) starts 5061 or 5060 — 16-19 digits, we'll use 16
      return `506${Math.random() < 0.5 ? "0" : "1"}${randomDigits(12)}`;
    case "visa":
    default:
      // Visa starts with 4 — 16 digits total
      return `4${randomDigits(15)}`;
  }
};

export const generateCvv = (network = "visa") => {
  // Amex uses a 4-digit CID, everyone else uses 3-digit CVV
  return network === "amex" ? randomDigits(4) : randomDigits(3);
};

export const generateExpiry = () => {
  const now = new Date();
  const expiryYear = (now.getFullYear() + 4).toString().slice(-2); // 4 years out
  const expiryMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  return { expiryMonth, expiryYear };
};