import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 text-base outline-none placeholder:text-[var(--color-muted-fg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-32 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-base outline-none placeholder:text-[var(--color-muted-fg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
