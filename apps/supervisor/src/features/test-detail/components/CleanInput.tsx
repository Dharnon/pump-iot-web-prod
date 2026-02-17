import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface CleanInputProps {
  label: string;
  value: any;
  unit?: string;
  onChange?: (val: string) => void;
  className?: string;
  labelClassName?: string;
  type?: "text" | "number";
}

export function CleanInput({
  label,
  value,
  unit,
  onChange,
  className,
  labelClassName,
  type = "text",
}: CleanInputProps) {
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <label
          className={`text-[10px] uppercase font-bold tracking-tight transition-colors ${error ? "text-destructive" : labelClassName || "text-muted-foreground"}`}
        >
          {label}
        </label>
      </div>
      <div
        className={`relative rounded-md border transition-all ${error ? "border-destructive ring-1 ring-destructive/20" : "border-transparent"}`}
      >
        <Input
          disabled={!onChange}
          value={value ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="-"
          className={`h-9 bg-muted/20 hover:bg-muted/40 focus:bg-background focus:border-input transition-all pr-12 font-mono text-sm ${className || ""}`}
        />
        {unit && (
          <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground font-bold pointer-events-none">
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
