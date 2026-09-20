"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackagePlus, Shirt, ClipboardList, Wallet, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/reception", label: "Dépôt", icon: PackagePlus },
  { href: "/ateliers", label: "Ateliers", icon: Shirt },
  { href: "/commandes", label: "Commandes", icon: ClipboardList },
  { href: "/caisse", label: "Caisse", icon: Wallet },
  { href: "/rapports", label: "Rapports", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-2 py-2 md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}