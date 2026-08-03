import { useEffect, type ReactNode } from "react";

import {
  clearAuthReturnTo,
  getAuthReturnTo,
  useAuthStore,
} from "../../store/authStore";

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  useEffect(() => initialize(), [initialize]);

  useEffect(() => {
    if (
      !isInitialized ||
      new URLSearchParams(window.location.search).get("authCallback") !==
        "google"
    ) {
      return;
    }

    const storedReturnTo = getAuthReturnTo();
    const returnTo = storedReturnTo.startsWith("/") ? storedReturnTo : "/";
    clearAuthReturnTo();
    window.location.replace(user ? returnTo : "/login");
  }, [isInitialized, user]);

  return children;
};

export default AuthInitializer;
