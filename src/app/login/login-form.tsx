"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "./actions";

export function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          setError(null);
          const res = await loginAction(fd);
          if (res?.error) setError(res.error);
        });
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="next" value={next} />
      <Input
        name="passcode"
        type="password"
        autoComplete="current-password"
        placeholder="Passcode"
        autoFocus
        required
      />
      {error ? (
        <p className="text-center text-sm text-[var(--color-danger)]">{error}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Unlocking..." : "Unlock"}
      </Button>
      <p className="mt-4 text-center text-xs text-[var(--color-muted-fg)]">
        Add to Home Screen for an app-like experience.
      </p>
    </form>
  );
}
