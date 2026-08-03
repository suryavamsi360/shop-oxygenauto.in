import { LogIn, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import Button from "../components/common/Button";
import { useAuthStore } from "../store/authStore";

const Login = () => {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isSigningIn = useAuthStore((state) => state.isSigningIn);
  const authError = useAuthStore((state) => state.error);
  const signInWithPassword = useAuthStore((state) => state.signInWithPassword);
  const signUpWithPassword = useAuthStore((state) => state.signUpWithPassword);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const returnTo = searchParams.get("returnTo") || "/";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formError, setFormError] = useState("");

  const switchMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") || "").trim();
    const password = String(formData.get("password") || "");

    if (password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    try {
      if (mode === "login") {
        if (
          !/^\S+@\S+\.\S+$/.test(identifier) &&
          !/^\d{10}$/.test(identifier)
        ) {
          setFormError("Enter a valid email or 10-digit phone number.");
          return;
        }
        await signInWithPassword(identifier, password, returnTo);
        return;
      }

      const email = identifier;
      const phone = String(formData.get("phone") || "").trim();
      const confirmPassword = String(formData.get("confirmPassword") || "");
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setFormError("Enter a valid email address.");
        return;
      }
      if (!/^\d{10}$/.test(phone)) {
        setFormError("Phone number must contain exactly 10 digits.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }

      await signUpWithPassword(email, phone, password, returnTo);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    }
  };

  if (isInitialized && user) {
    return <Navigate to={returnTo} replace />;
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
      <section className="w-full border-y border-[#D7DCD5] py-10 text-center">
        <p className="text-xs font-bold uppercase text-[#0D542B]">
          Customer account
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase text-[#202522]">
          {mode === "login" ? "Sign in to order" : "Create your account"}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[#68706A]">
          Save delivery addresses and securely place orders from your account.
        </p>

        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          isLoading={isSigningIn || !isInitialized}
          onClick={() => void signInWithGoogle(returnTo)}
        >
          <span className="flex size-7 items-center justify-center rounded bg-white">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              aria-hidden="true"
              className="size-4"
            />
          </span>
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase text-[#8A918B]">
          <span className="h-px flex-1 bg-[#D7DCD5]" />
          or use email / phone
          <span className="h-px flex-1 bg-[#D7DCD5]" />
        </div>

        <div className="grid grid-cols-2 rounded-md border border-[#C9D0C8] bg-[#F1F3EF] p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`min-h-10 rounded px-3 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-[#0D542B] shadow-sm"
                : "text-[#68706A]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`min-h-10 rounded px-3 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-[#0D542B] shadow-sm"
                : "text-[#68706A]"
            }`}
          >
            Create account
          </button>
        </div>

        <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="account-email"
              className="mb-1.5 block text-sm font-semibold text-[#3E453F]"
            >
              {mode === "login" ? "Email or phone number" : "Email"}
            </label>
            <input
              id="account-email"
              name="identifier"
              type={mode === "login" ? "text" : "email"}
              inputMode={mode === "login" ? "email" : undefined}
              autoComplete={mode === "login" ? "username" : "email"}
              required
              placeholder={mode === "login" ? "Email or 10-digit phone" : ""}
              className="h-11 w-full rounded-md border border-[#C9D0C8] bg-white px-3 text-[#202522] outline-none transition focus:border-[#0D542B]"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label
                htmlFor="account-phone"
                className="mb-1.5 block text-sm font-semibold text-[#3E453F]"
              >
                Phone number
              </label>
              <input
                id="account-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                required
                placeholder="10-digit number"
                className="h-11 w-full rounded-md border border-[#C9D0C8] bg-white px-3 text-[#202522] outline-none transition placeholder:text-[#8A918B] focus:border-[#0D542B]"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="account-password"
              className="mb-1.5 block text-sm font-semibold text-[#3E453F]"
            >
              Password
            </label>
            <input
              id="account-password"
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={8}
              required
              className="h-11 w-full rounded-md border border-[#C9D0C8] bg-white px-3 text-[#202522] outline-none transition focus:border-[#0D542B]"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label
                htmlFor="account-confirm-password"
                className="mb-1.5 block text-sm font-semibold text-[#3E453F]"
              >
                Confirm password
              </label>
              <input
                id="account-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11 w-full rounded-md border border-[#C9D0C8] bg-white px-3 text-[#202522] outline-none transition focus:border-[#0D542B]"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isSigningIn || !isInitialized}
          >
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {(formError || authError) && (
          <p className="mt-4 text-sm text-[#B42318]">
            {formError || authError}
          </p>
        )}
      </section>
    </main>
  );
};

export default Login;
