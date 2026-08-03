const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

export const API_BASE_URL =
  import.meta.env.VITE_PRODUCTS_API_BASE_URL ||
  import.meta.env.VITE_PRODUCTS_API_URL ||
  DEFAULT_API_BASE_URL;