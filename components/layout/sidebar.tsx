"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PackagePlus,
  Shirt,
  ClipboardList,
  Wallet,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/reception", label: "Réception", icon: PackagePlus },
  { href: "/ateliers", label: "Ateliers", icon: Shirt },
  { href: "/commandes", label: "Commandes", icon: ClipboardList },
  { href: "/caisse", label: "Caisse", icon: Wallet },
  { href: "/rapports", label: "Rapports", icon: BarChart3 },
];

export function Sidebar({ nom, role }: { nom: string; role: string }) {
  const [ouvert, setOuvert] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  async function deconnexion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen flex-col border-r border-primary-dark/20 bg-primary-dark text-white transition-all duration-200",
        ouvert ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-center px-4 py-6">
        <Image
          src="/images/logo.png"
          alt="Crystal Pressing"
          width={ouvert ? 72 : 44}
          height={ouvert ? 72 : 44}
          className="rounded-xl object-contain transition-all duration-200"
        />
      </div>

      <button
        onClick={() => setOuvert(!ouvert)}
        className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-lg border border-white/15 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
      >
        {ouvert ? (
          <>
            <PanelLeftClose className="h-4 w-4" />
            Réduire
          </>
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </button>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const actif = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                actif
                  ? "bg-primary text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {ouvert && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2",
            !ouvert && "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold">
            {nom.charAt(0)}
          </div>
          {ouvert && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{nom}</p>
              <p className="truncate text-xs text-white/60">{role}</p>
            </div>
          )}
          <button onClick={deconnexion} className="shrink-0 text-white/60 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}