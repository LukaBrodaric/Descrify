import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-slate-800/50 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus:ring-red-500" : "border-slate-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
