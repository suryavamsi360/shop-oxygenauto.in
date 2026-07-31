import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  intent?: "discount" | "success" | "warning" | "neutral";
}

const intentClasses = {
  discount: "border-[#00A63E] bg-[#00A63E] text-white",
  success: "border-[#B7D7C2] bg-[#E5F3EA] text-[#0D542B]",
  warning: "border-[#F1C99D] bg-[#FFF4E5] text-[#8A3E08]",
  neutral: "border-[#D7DCD5] bg-[#F4F5F1] text-[#515852]",
};

const Badge = ({
  children,
  className = "",
  intent = "neutral",
}: BadgeProps) => (
  <span
    className={`inline-flex min-h-6 items-center rounded-full border px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] ${intentClasses[intent]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
