import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../components/layout/Loading";
import {
  clearAuthReturnTo,
  getAuthReturnTo,
  useAuthStore,
} from "../store/authStore";

const AuthCallback = () => {
  const navigate = useNavigate();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isInitialized) return;

    const returnTo = getAuthReturnTo();
    clearAuthReturnTo();
    navigate(user ? returnTo : "/login", { replace: true });
  }, [isInitialized, navigate, user]);

  return <Loading />;
};

export default AuthCallback;
