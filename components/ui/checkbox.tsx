import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };
    
    return (
      <label className={cn("flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-md border-2 transition-all duration-200",
              "border-slate-600 bg-slate-800/50",
              "peer-checked:bg-indigo-600 peer-checked:border-indigo-600",
              "group-hover:border-slate-500",
              "flex items-center justify-center"
            )}
          >
            {checked && <Check className="h-3.5 w-3.5 text-white" />}
          </div>
        </div>
        <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
          {label}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
