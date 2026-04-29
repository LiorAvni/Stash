import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-safe pb-safe">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-3xl font-extrabold text-white shadow-lg">
            S
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME || "Stash"}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-fg)]">
            Your private personal storage.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
