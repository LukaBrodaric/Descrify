import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
