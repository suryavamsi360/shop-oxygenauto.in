import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import { supabase } from "../config/supabase";
import { API_BASE_URL } from "../config/api";

const RETURN_TO_KEY = "oxygenauto-auth-return-to";

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  isSigningIn: boolean;
  error: string | null;
  initialize: () => () => void;
  signInWithPassword: (
    identifier: string,
    password: string,
    returnTo?: string,
  ) => Promise<void>;
  signUpWithPassword: (
    email: string,
    phone: string,
    password: string,
    returnTo?: string,
  ) => Promise<void>;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const getAuthReturnTo = () =>
  window.sessionStorage.getItem(RETURN_TO_KEY) || "/";

export const clearAuthReturnTo = () =>
  window.sessionStorage.removeItem(RETURN_TO_KEY);

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,
  isSigningIn: false,
  error: null,

  initialize: () => {
    let active = true;

    void supabase.auth.getSession().then(async ({ data, error }) => {
      const session = data.session;
      const currentUser = session ? await supabase.auth.getUser() : null;
      if (!active) return;
      set({
        session,
        user: currentUser?.data.user || session?.user || null,
        isInitialized: true,
        error: error?.message || currentUser?.error?.message || null,
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      set({
        session,
        user: session?.user || null,
        isInitialized: true,
        isSigningIn: false,
        error: null,
      });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  },

  signInWithPassword: async (identifier, password, returnTo = "/") => {
    set({ isSigningIn: true, error: null });
    window.sessionStorage.setItem(RETURN_TO_KEY, returnTo);

    const normalizedIdentifier = identifier.trim();
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: normalizedIdentifier, password }),
    });
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      session?: { accessToken?: string; refreshToken?: string };
    } | null;
    if (!response.ok) {
      const message = payload?.message || "Unable to sign in.";
      set({ isSigningIn: false, error: message });
      throw new Error(message);
    }

    const accessToken = payload?.session?.accessToken;
    const refreshToken = payload?.session?.refreshToken;
    if (!accessToken || !refreshToken) {
      set({ isSigningIn: false, error: "Account session was not returned." });
      throw new Error("Account session was not returned.");
    }
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      set({ isSigningIn: false, error: error.message });
      throw error;
    }
    set({
      session: data.session,
      user: data.user,
      isSigningIn: false,
      error: null,
    });
  },

  signUpWithPassword: async (
    email,
    phone,
    password,
    returnTo = "/",
  ) => {
    set({ isSigningIn: true, error: null });
    window.sessionStorage.setItem(RETURN_TO_KEY, returnTo);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, password }),
    });
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      session?: { accessToken?: string; refreshToken?: string };
    } | null;
    if (!response.ok) {
      const message = payload?.message || "Unable to create the account.";
      set({ isSigningIn: false, error: message });
      throw new Error(message);
    }

    const accessToken = payload?.session?.accessToken;
    const refreshToken = payload?.session?.refreshToken;
    if (!accessToken || !refreshToken) {
      set({ isSigningIn: false, error: "Account session was not returned." });
      throw new Error("Account session was not returned.");
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      set({ isSigningIn: false, error: error.message });
      throw error;
    }
    set({
      session: data.session,
      user: data.user,
      isSigningIn: false,
      error: null,
    });
  },

  signInWithGoogle: async (returnTo = "/") => {
    set({ isSigningIn: true, error: null });
    window.sessionStorage.setItem(RETURN_TO_KEY, returnTo);

    const isLocalhost = ["localhost", "127.0.0.1"].includes(
      window.location.hostname,
    );
    const callbackPath = isLocalhost
      ? "/auth/callback"
      : "/?authCallback=google";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${callbackPath}`,
      },
    });
    if (error) {
      set({ isSigningIn: false, error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ session: null, user: null, error: null });
  },
}));