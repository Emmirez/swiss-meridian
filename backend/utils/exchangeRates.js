// Simple in-memory cache so we don't hit the exchange rate API on every
// single transfer — rates only meaningfully change once every 24h anyway
// on the free tier we're using.
let cachedRates = null;
let cachedAt = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const getExchangeRates = async () => {
  const now = Date.now();
  if (cachedRates && cachedAt && now - cachedAt < CACHE_DURATION_MS) {
    return cachedRates;
  }

  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  const data = await res.json();
  if (data.result !== "success") {
    throw new Error("Could not fetch exchange rates");
  }

  cachedRates = data.rates;
  cachedAt = now;
  return cachedRates;
};

/**
 * Converts an amount from one currency to another using USD as the pivot,
 * since the free API only gives rates relative to USD.
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;

  const rates = await getExchangeRates();
  const fromRate = fromCurrency === "USD" ? 1 : rates[fromCurrency];
  const toRate = toCurrency === "USD" ? 1 : rates[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
  }

  const amountInUsd = amount / fromRate;
  const converted = amountInUsd * toRate;
  return Math.round(converted * 100) / 100;
};