import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center">
    <div className="mb-5 flex size-12 items-center justify-center rounded-md border border-[#C9D0C8] bg-white text-[#0D542B] shadow-sm">
      <Icon size={22} strokeWidth={1.8} />
    </div>
    <h2 className="font-display text-2xl font-semibold uppercase text-[#202522]">
      {title}
    </h2>
    <p className="mt-2 max-w-sm text-sm leading-6 text-[#68706A]">
      {description}
    </p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
