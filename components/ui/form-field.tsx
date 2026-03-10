import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export { FormField };
