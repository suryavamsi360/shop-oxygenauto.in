const LOCAL_API_BASE_URL = "http://localhost:8000/api";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export const resolveApiBaseUrl = (
  hostname: string,
  configuredApiBaseUrl?: string,
) =>
  LOCAL_HOSTNAMES.has(hostname.toLowerCase())
    ? LOCAL_API_BASE_URL
    : configuredApiBaseUrl || LOCAL_API_BASE_URL;

const hostname = typeof window === "undefined" ? "" : window.location.hostname;
const configuredApiBaseUrl =
  import.meta.env.VITE_PRODUCTS_API_BASE_URL ||
  import.meta.env.VITE_PRODUCTS_API_URL;

export const API_BASE_URL = resolveApiBaseUrl(
  hostname,
  configuredApiBaseUrl,
);