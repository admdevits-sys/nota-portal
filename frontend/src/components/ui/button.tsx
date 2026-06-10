import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandGreen-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-brandGreen-500 text-white hover:bg-brandGreen-600 dark:bg-brandGreen-500 dark:hover:bg-brandGreen-400",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  };

  return <button type={type} className={clsx(base, variantClasses[variant], className)} {...props} />;
}
