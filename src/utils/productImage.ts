const PRODUCT_PLACEHOLDER_IMAGE = "/placeholder-image.svg";

export const getProductImage = (images: string[] = []) =>
  images.find(
    (image) => typeof image === "string" && image.trim().length > 0,
  ) || PRODUCT_PLACEHOLDER_IMAGE;