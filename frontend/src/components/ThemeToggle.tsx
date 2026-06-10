import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:border-brandGreen-300 hover:bg-brandGreen-50 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:border-brandGreen-600"
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
