import Link from "next/link";
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Stash";
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-fg)]">
          App
        </h2>
        <Link
          href="/trash"
          className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <Trash2 className="h-5 w-5" /> Trash
          </span>
          <span className="text-[var(--color-muted-fg)]">{">"}</span>
        </Link>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-fg)]">
          Session
        </h2>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="lg" className="w-full">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </form>
      </section>

      <p className="mt-4 text-center text-xs text-[var(--color-muted-fg)]">
        {appName} · v1
      </p>
    </div>
  );
}
