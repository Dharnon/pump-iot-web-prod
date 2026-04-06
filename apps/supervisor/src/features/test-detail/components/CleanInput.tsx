import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dark-mode fill for detail form fields (matches CleanAutoInput) */
const inputSurfaceClass =
  "bg-background transition-all hover:bg-background focus:bg-background dark:bg-[#212121] dark:hover:bg-[#212121] dark:focus:bg-[#212121]";

interface CleanInputProps {
  label: string;
  value: any;
  unit?: string;
  onChange?: (val: string) => void;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  type?: "text" | "number";
}

export function CleanInput({
  label,
  value,
  unit,
  onChange,
  className,
  containerClassName,
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
    <div
      className={`min-w-0 space-y-2 ${containerClassName || ""}`}
    >
      <div className="flex justify-between">
        <label
          className={`text-xs font-medium uppercase tracking-[0.06em] leading-snug transition-colors ${error ? "text-destructive" : labelClassName || "text-foreground/70 dark:text-muted-foreground"}`}
        >
          {label}
        </label>
      </div>
      <div className="relative">
        <Input
          disabled={!onChange}
          value={value ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="-"
          className={cn(
            "h-10 pr-12 font-mono text-sm",
            inputSurfaceClass,
            error
              ? "border-destructive ring-1 ring-destructive/20"
              : "border-input/80",
            className,
          )}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
            {unit}
          </span>
        )}
        {error && (
          <div className="absolute -bottom-4 left-0 flex items-center gap-1 text-[11px] font-medium text-destructive animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
