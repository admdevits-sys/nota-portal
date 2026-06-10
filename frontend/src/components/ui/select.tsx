import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

export function SelectField<T extends string | number>({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label className="block text-sm text-slate-700 dark:text-slate-200">
      <span className="mb-2 block font-medium">{label}</span>
      <Select.Root value={String(value)} onValueChange={(val) => onValueChange(val as T)}>
        <Select.Trigger
          className="inline-flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition hover:border-brandGreen-400 focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brandGreen-500"
          aria-label={label}
        >
          <Select.Value />
          <Select.Icon>
            <ChevronDown className="h-4 w-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-950">
            <Select.Viewport className="p-2">
              {options.map((option) => (
                <Select.Item
                  key={String(option.value)}
                  value={String(option.value)}
                  className={clsx(
                    "relative flex cursor-pointer select-none items-center rounded-2xl px-3 py-2 text-sm text-slate-900 outline-none data-[state=checked]:bg-brandGreen-600 data-[state=checked]:text-white dark:text-slate-100 dark:data-[state=checked]:bg-brandGreen-500"
                  )}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-3">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </label>
  );
}
