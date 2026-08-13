import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses = {
  primary:
    "border-transparent bg-[#187A45] text-white hover:bg-[#126638] shadow-sm",
  secondary:
    "border-[#BFC7BE] bg-white text-[#202522] hover:border-[#0D542B] hover:text-[#0D542B]",
  quiet:
    "border-transparent bg-transparent text-[#68706A] hover:bg-[#E9ECE6] hover:text-[#202522]",
  danger: "border-transparent bg-[#B42318] text-white hover:bg-[#8F1C13]",
};

const sizeClasses = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && (
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      />
    )}
    {children}
  </button>
);

export default Button;
