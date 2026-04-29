"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export function MenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={6}
        align={align}
        className={cn(
          "z-50 min-w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-lg",
          className,
        )}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export function MenuItem({
  children,
  onSelect,
  variant = "default",
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        e.preventDefault();
        onSelect?.();
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none",
        "hover:bg-[var(--color-muted)] data-[highlighted]:bg-[var(--color-muted)]",
        variant === "danger" && "text-[var(--color-danger)]",
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}
