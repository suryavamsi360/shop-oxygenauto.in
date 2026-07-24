const DEFAULT_CURRENCY_SYMBOL = "Rs.";

export const getCurrencySymbol = () => {
  return import.meta.env.VITE_CURRENCY_SYMBOL || DEFAULT_CURRENCY_SYMBOL;
};

export const formatMoney = (amount: number, includeDecimals = false) => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (includeDecimals) {
    return safeAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return safeAmount.toLocaleString("en-IN");
};
