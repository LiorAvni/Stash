import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { BottomNav } from "@/components/bottom-nav";
import { ServiceWorkerRegister } from "@/components/sw-register";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) redirect("/login");

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col pt-safe">
      <ServiceWorkerRegister />
      <main className="flex-1 px-4 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
