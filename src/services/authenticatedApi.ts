import { supabase } from "../config/supabase";

const DEFAULT_API_BASE_URL = "http://localhost:8000/api";
export const API_BASE_URL =
  import.meta.env.VITE_PRODUCTS_API_BASE_URL ||
  import.meta.env.VITE_PRODUCTS_API_URL ||
  DEFAULT_API_BASE_URL;

export const authenticatedFetch = async (
  path: string,
  init: RequestInit = {},
) => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("Please sign in to continue.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }

  return response;
};