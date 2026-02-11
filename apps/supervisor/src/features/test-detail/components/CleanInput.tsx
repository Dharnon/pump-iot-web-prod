/**
 * CleanInput Component
 * 
 * Form input with integrated label and optional unit display.
 * Reusable form field component.
 */

import { Input } from "@/components/ui/input";

interface CleanInputProps {
  label: string;
  value: any;
  unit?: string;
  onChange?: (val: string) => void;
  className?: string;
}

export function CleanInput({ 
  label, 
  value, 
  unit, 
  onChange, 
  className 
}: CleanInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
      </div>
      <div className="relative">
        <Input
          disabled={!onChange}
          value={value ?? ""}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder="-"
          className={`h-9 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background focus:border-input transition-all pr-12 font-medium ${className || ""}`}
        />
        {unit && (
          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
