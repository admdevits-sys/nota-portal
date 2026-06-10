import { cn } from "../../lib/utils";

interface DocumentIconProps {
  type: "nfe" | "nfse";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function DocumentIcon({ type, className, size = "md" }: DocumentIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl shadow-lg",
        type === "nfe"
          ? "bg-gradient-to-br from-brandGreen-500 to-brandGreen-600"
          : "bg-gradient-to-br from-brandRed-500 to-brandRed-600",
        sizeStyles[size],
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn(size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8")}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="fill-white/20" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    </div>
  );
}
