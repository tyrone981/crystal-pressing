import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Crystal Pressing"
            width={36}
            height={36}
          />
          <span className="font-semibold text-foreground">
            Crystal Pressing
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Douala, Cameroun</p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-primary">
            Espace agent
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-muted-foreground">
        © {new Date().getFullYear()} Crystal Pressing. Tous droits réservés.
      </p>
    </footer>
  );
}