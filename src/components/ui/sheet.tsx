"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

export const Sheet = Drawer.Root;
export const SheetTrigger = Drawer.Trigger;
export const SheetClose = Drawer.Close;

export function SheetContent({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
      <Drawer.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[92vh] flex-col rounded-t-3xl border-t border-[var(--color-border)] bg-[var(--color-bg)] outline-none",
          className,
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-[var(--color-border)]" />
        {title ? (
          <Drawer.Title className="px-5 pt-3 text-lg font-semibold">
            {title}
          </Drawer.Title>
        ) : (
          <Drawer.Title className="sr-only">Sheet</Drawer.Title>
        )}
        <Drawer.Description className="sr-only">Bottom sheet</Drawer.Description>
        <div className="overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3">
          {children}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  );
}
