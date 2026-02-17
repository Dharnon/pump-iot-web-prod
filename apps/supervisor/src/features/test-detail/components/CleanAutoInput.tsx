import { useState, useEffect } from "react";
import { AutoResizeInput } from "@/components/ui/auto-resize-input";
import { AlertCircle } from "lucide-react";

interface CleanAutoInputProps {
  label: string;
  value: any;
  unit?: string;
  onChange?: (val: string) => void;
  className?: string;
  minWidth?: number | string;
  type?: "text" | "number";
}

export function CleanAutoInput({
  label,
  value,
  unit,
  onChange,
  className,
  minWidth = 120,
  type = "text",
}: CleanAutoInputProps) {
  const [error, setError] = useState<string | null>(null);

  // Simple numeric validation: allows numbers, dot, comma and minus
  const validate = (val: string) => {
    if (type === "number" && val && val !== "-") {
      const isNumeric = /^[0-9.,-]*$/.test(val);
      if (!isNumeric) {
        return "Dato incorrecto";
      }
    }
    return null;
  };

  const handleChange = (val: string) => {
    const err = validate(val);
    setError(err);
    if (onChange) onChange(val);
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-min">
      <div className="flex justify-between">
        <label
          className={`text-[10px] uppercase font-bold tracking-tight transition-colors ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {label}
        </label>
      </div>
      <div
        className={`relative inline-flex items-center rounded-md border transition-all ${error ? "border-destructive ring-1 ring-destructive/20" : "border-transparent"}`}
      >
        <AutoResizeInput
          disabled={!onChange}
          value={value ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="-"
          minWidth={minWidth}
          className={`h-9 bg-muted/20 hover:bg-muted/40 focus:bg-background focus:border-input transition-all ${unit ? "pr-8" : ""} font-mono text-sm ${className || ""}`}
        />
        {unit && (
          <span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground font-bold pointer-events-none">
            {unit}
          </span>
        )}
        {error && (
          <div className="absolute -bottom-4 left-0 flex items-center gap-1 text-[9px] text-destructive font-bold animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-2.5 h-2.5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
