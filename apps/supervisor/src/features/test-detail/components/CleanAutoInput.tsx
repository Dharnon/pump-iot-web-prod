import { AutoResizeInput } from "@/components/ui/auto-resize-input";

interface CleanAutoInputProps {
    label: string;
    value: any;
    unit?: string;
    onChange?: (val: string) => void;
    className?: string;
    minWidth?: number | string;
}

export function CleanAutoInput({
    label,
    value,
    unit,
    onChange,
    className,
    minWidth = 120
}: CleanAutoInputProps) {
    return (
        <div className="flex flex-col gap-1.5 min-w-min">
            <div className="flex justify-between">
                <label className="text-xs text-muted-foreground whitespace-nowrap">{label}</label>
            </div>
            <div className="relative inline-flex items-center">
                <AutoResizeInput
                    disabled={!onChange}
                    value={value ?? ""}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    placeholder="-"
                    minWidth={minWidth}
                    className={`h-9 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background focus:border-input transition-all ${unit ? "pr-8" : ""} font-medium ${className || ""}`}
                />
                {unit && (
                    <span className="absolute right-2 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}
