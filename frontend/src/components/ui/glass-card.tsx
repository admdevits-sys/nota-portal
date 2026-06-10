import { cn } from "../../lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "green" | "red" | "silver" | "none";
}

const glowStyles = {
  green: "hover:shadow-lg hover:shadow-brandGreen-light/20 dark:hover:shadow-brandGreen-neon/30",
  red: "hover:shadow-lg hover:shadow-brandRed-light/20 dark:hover:shadow-brandRed-soft/30",
  silver: "hover:shadow-lg hover:shadow-brandSilver-light/20 dark:hover:shadow-brandSilver-dark/20",
  none: "",
};

export function GlassCard({ children, className, hover, glow = "none" }: GlassCardProps) {
  return (
    <div
      className={cn(
        // Light Mode - Fundo sólido branco, não glassmorphism
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300",
        // Dark Mode - Superfície escura com borda sutil
        "dark:border-slate-800 dark:bg-[#1A1A1A]",
        hover && glowStyles[glow],
        hover && "hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
