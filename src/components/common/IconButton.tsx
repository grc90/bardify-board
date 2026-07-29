import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const SIZES: Record<string, string> = {
  sm: "h-7 w-7 text-sm",
  md: "h-9 w-9 text-base",
  lg: "h-12 w-12 text-xl",
};

export function IconButton({ label, active, size = "md", className = "", children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex items-center justify-center rounded-full transition-colors ${SIZES[size]} ${
        active ? "bg-violet-600 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
      } disabled:opacity-40 disabled:hover:bg-transparent ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
