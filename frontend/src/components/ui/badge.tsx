import { cn } from "../../lib/utils";

type BadgeVariant = "nfe" | "nfse" | "success" | "warning" | "error" | "info" | "default" | "purple" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<BadgeVariant, string> = {
  nfe: "bg-gradient-to-br from-brandGreen-500 via-brandGreen-600 to-brandGreen-700 text-white shadow-lg shadow-brandGreen-500/30",
  nfse: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/30",
  success: "bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30",
  warning: "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30",
  error: "bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white shadow-lg shadow-rose-500/30",
  info: "bg-gradient-to-br from-brandGreen-500 via-brandGreen-600 to-brandGreen-700 text-white shadow-lg shadow-brandGreen-500/30",
  purple: "bg-gradient-to-br from-brandRed-500 via-brandRed-600 to-brandRed-700 text-white shadow-lg shadow-brandRed-500/30",
  orange: "bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/30",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-none",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

export function Badge({ children, variant = "default", className, pulse, size = "md" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", {
            "bg-blue-300": variant === "nfe",
            "bg-emerald-300": variant === "nfse" || variant === "success",
            "bg-amber-300": variant === "warning",
            "bg-rose-300": variant === "error",
            "bg-brandGreen-300": variant === "info",
            "bg-brandRed-300": variant === "purple",
            "bg-orange-300": variant === "orange",
          })} />
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", {
            "bg-blue-400": variant === "nfe",
            "bg-emerald-400": variant === "nfse" || variant === "success",
            "bg-amber-400": variant === "warning",
            "bg-rose-400": variant === "error",
            "bg-brandGreen-400": variant === "info",
            "bg-brandRed-400": variant === "purple",
            "bg-orange-400": variant === "orange",
          })} />
        </span>
      )}
      {children}
    </span>
  );
}