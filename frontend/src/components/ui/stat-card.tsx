import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  variant?: "default" | "green" | "red" | "silver" | "amber";
  className?: string;
}

const variantStyles = {
  default: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
  green: "bg-brandGreen-50 dark:bg-brandGreen-500/10 text-brandGreen-600 dark:text-brandGreen-300",
  red: "bg-brandRed-50 dark:bg-brandRed-500/10 text-brandRed-600 dark:text-brandRed-300",
  silver: "bg-brandSilver-50 dark:bg-brandSilver-500/10 text-brandSilver-600 dark:text-brandSilver-300",
  amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300",
};

const iconBgStyles = {
  default: "bg-slate-200 dark:bg-slate-700",
  green: "bg-brandGreen-100 dark:bg-brandGreen-500/20",
  red: "bg-brandRed-100 dark:bg-brandRed-500/20",
  silver: "bg-brandSilver-100 dark:bg-brandSilver-500/20",
  amber: "bg-amber-100 dark:bg-amber-500/20",
};

export function StatCard({ label, value, icon, trend, variant = "default", className }: StatCardProps) {
  return (
    <div className={cn("group relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/50 dark:bg-slate-900", className)}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-transparent opacity-60 transition-all duration-300 group-hover:scale-150 dark:from-slate-800 dark:opacity-40" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.value >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-rose-500" />
              )}
              <span className={cn("text-xs font-semibold", trend.value >= 0 ? "text-emerald-600" : "text-rose-600")}>
                {trend.value >= 0 ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110", iconBgStyles[variant])}>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", variantStyles[variant])}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}