import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "../../store/authStore";

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => initialize(), [initialize]);

  return children;
};

export default AuthInitializer;
