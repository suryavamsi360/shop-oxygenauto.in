export const maskPartNumber = (partNumber: string) => {
  const normalizedPartNumber = partNumber.trim();
  if (!normalizedPartNumber) {
    return "-";
  }

  if (normalizedPartNumber.length <= 4) {
    return "*".repeat(normalizedPartNumber.length);
  }

  return `${"*".repeat(normalizedPartNumber.length - 4)}${normalizedPartNumber.slice(-4)}`;
};