"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/",          label: "Home",      icon: Home },
  { href: "/search",    label: "Search",    icon: Search },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] transition",
                  active
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]",
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
