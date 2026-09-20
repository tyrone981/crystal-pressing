import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-start overflow-hidden">
      <Image
        src="/images/hero-bg.jpg"
        alt="Vêtements propres suspendus sur un fil à linge"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/55" />
      <div className="relative w-full px-6 pt-8 md:px-12 md:pt-12">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-dark">
            Crystal Pressing — Douala
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Vos vêtements et accessoires ressortent cristallisés après un
            nettoyage ici
          </h1>
          <p className="mt-5 text-base text-foreground/80 sm:text-lg">
            Suivi de chaque vêtement du dépôt à la livraison, calcul
            automatique des paiements, et zéro perte d&apos;accessoire.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Accéder au tableau de bord
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}