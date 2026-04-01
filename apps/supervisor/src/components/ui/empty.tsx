import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const emptyVariants = cva(
    "flex flex-col items-center justify-center text-center p-8",
    {
        variants: {
            size: {
                default: "py-12",
                sm: "py-6",
                lg: "py-16",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
)

interface EmptyProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyVariants> { }

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
    ({ className, size, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(emptyVariants({ size }), className)}
            {...props}
        />
    )
)
Empty.displayName = "Empty"

const EmptyHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col items-center gap-2", className)}
        {...props}
    />
))
EmptyHeader.displayName = "EmptyHeader"

const emptyMediaVariants = cva(
    "flex items-center justify-center rounded-full",
    {
        variants: {
            variant: {
                default: "w-16 h-16 bg-muted",
                icon: "w-12 h-12 text-muted-foreground",
                outline: "w-16 h-16 border-2 border-dashed border-muted-foreground/25",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface EmptyMediaProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyMediaVariants> { }

const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
    ({ className, variant, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(emptyMediaVariants({ variant }), className)}
            {...props}
        >
            {React.isValidElement(children)
                ? React.cloneElement(children as React.ReactElement<{ className?: string }>, {
                    className: cn(
                        "w-6 h-6",
                        variant === "icon" && "w-8 h-8",
                        (children as React.ReactElement<{ className?: string }>).props.className
                    ),
                })
                : children}
        </div>
    )
)
EmptyMedia.displayName = "EmptyMedia"

const EmptyTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-semibold mt-4", className)}
        {...props}
    />
))
EmptyTitle.displayName = "EmptyTitle"

const EmptyDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground max-w-sm", className)}
        {...props}
    />
))
EmptyDescription.displayName = "EmptyDescription"

const EmptyContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-6", className)}
        {...props}
    />
))
EmptyContent.displayName = "EmptyContent"

export {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
}
