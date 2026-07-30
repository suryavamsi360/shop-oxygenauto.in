const sanitizePhoneNumber = (value: string) => value.replace(/\D/g, "");

const buildRequirementCtaUrl = () => {
  const phoneNumber = sanitizePhoneNumber(
    String(import.meta.env.VITE_REQUIREMENT_CTA_NUMBER || ""),
  );
  const message = String(import.meta.env.VITE_REQUIREMENT_CTA_TEXT || "/Hi").trim() || "/Hi";

  if (phoneNumber) {
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  return (
    import.meta.env.VITE_REQUIREMENT_CTA_URL ||
    `https://wa.me/?text=${encodeURIComponent(message)}`
  );
};

export const REQUIREMENT_CTA_URL = buildRequirementCtaUrl();
