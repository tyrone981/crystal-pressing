import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar nom={session.nom} role={session.role} />
      <div className="relative flex-1 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark via-primary to-[#0f3d3d] md:hidden">
          <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 -right-10 h-52 w-52 rounded-full border border-white/15" />
        </div>
        <main className="relative z-10 pb-24 md:pb-0">
          <div className="mx-3 mt-4 min-h-[calc(100vh-2rem)] rounded-3xl bg-background p-1 shadow-xl md:mx-0 md:mt-0 md:min-h-0 md:rounded-none md:bg-transparent md:p-0 md:shadow-none">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
