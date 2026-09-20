import Image from "next/image";
import Link from "next/link";

export function PublicNavbar() {
  return (
    <header className="flex items-center justify-between px-6 py-3 md:px-12">
      <Link href="/">
        <Image
          src="/images/logo.png"
          alt="Crystal Pressing"
          width={64}
          height={64}
          className="h-14 w-14 rounded-lg object-contain md:h-16 md:w-16"
          priority
        />
      </Link>
      <Link
        href="/login"
        className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
      >
        Se connecter
      </Link>
    </header>
  );
}