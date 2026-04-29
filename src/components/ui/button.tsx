import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-[var(--color-accent-fg)] hover:opacity-90",
        secondary:
          "bg-[var(--color-muted)] text-[var(--color-fg)] hover:bg-[var(--color-border)]",
        ghost: "text-[var(--color-fg)] hover:bg-[var(--color-muted)]",
        danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
        outline:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-muted)]",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
