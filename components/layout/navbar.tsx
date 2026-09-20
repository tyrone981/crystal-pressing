"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/reception", label: "Réception" },
  { href: "/ateliers", label: "Ateliers" },
  { href: "/commandes", label: "Commandes" },
  { href: "/caisse", label: "Caisse" },
  { href: "/rapports", label: "Rapports" },
];

export function Navbar({ nom, role }: { nom: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function deconnexion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="hidden md:flex items-center justify-between border-b border-border bg-card px-8 py-4">
      <Link href="/reception">
  <Image
    src="/images/logo.png"
    alt="Crystal Pressing"
    width={56}
    height={56}
    className="h-12 w-12 rounded-lg object-contain"
  />
</Link>
      <nav className="flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(link.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {nom} · {role}
        </span>
        <button onClick={deconnexion} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}