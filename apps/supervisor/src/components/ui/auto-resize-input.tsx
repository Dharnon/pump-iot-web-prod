import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoResizeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    minWidth?: number | string
}

const AutoResizeInput = React.forwardRef<HTMLInputElement, AutoResizeInputProps>(
    ({ className, minWidth = 100, value, placeholder, onChange, ...props }, ref) => {
        const [width, setWidth] = React.useState<number | string>(minWidth)
        const spanRef = React.useRef<HTMLSpanElement>(null)

        React.useEffect(() => {
            if (spanRef.current) {
                // Measure the width of the text
                const textToMeasure = (value as string) || (placeholder as string) || ""
                spanRef.current.textContent = textToMeasure

                // Add some padding for the cursor and borders
                const measuredWidth = spanRef.current.offsetWidth + 24

                // Ensure it respects minWidth
                const newWidth = Math.max(measuredWidth, typeof minWidth === 'number' ? minWidth : 0)

                setWidth(newWidth)
            }
        }, [value, placeholder, minWidth])

        return (
            <div className="relative inline-flex min-w-0 max-w-full">
                {/* Hidden span for measurement */}
                <span
                    ref={spanRef}
                    className={cn(
                        "absolute opacity-0 pointer-events-none whitespace-pre",
                        // Match input font styles for accurate measurement
                        "text-base md:text-sm font-medium px-3",
                        className // Include className to match font styles passed to input
                    )}
                    aria-hidden
                />

                <input
                    ref={ref}
                    style={{ width: width }}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 rounded-md border bg-secondary px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        className
                    )}
                    {...props}
                />
            </div>
        )
    }
)
AutoResizeInput.displayName = "AutoResizeInput"

export { AutoResizeInput }
