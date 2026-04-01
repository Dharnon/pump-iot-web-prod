"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FieldProps = React.HTMLAttributes<HTMLDivElement>;

function Field({ className, ...props }: FieldProps) {
  return <div data-slot="field" className={cn("grid gap-2", className)} {...props} />;
}

function FieldGroup({ className, ...props }: FieldProps) {
  return <div data-slot="field-group" className={cn("flex flex-col gap-5", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none text-foreground", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldSeparator({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="field-separator" className={cn("relative py-1", className)} {...props}>
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      {children ? (
        <span className="relative mx-auto block w-fit bg-card px-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {children}
        </span>
      ) : null}
    </div>
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator };
