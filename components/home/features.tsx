import Image from "next/image";
import { Sparkles, Shirt, Wallet } from "lucide-react";

const features = [
  {
    title: "Traçabilité complète",
    description:
      "Chaque vêtement suit son parcours à travers les trois centres : réception, lavage, repassage.",
    icon: Shirt,
    image: "/images/before-after.jpg",
  },
  {
    title: "Zéro accessoire perdu",
    description:
      "Ceintures, broches et boutons amovibles sont enregistrés et contrôlés avant chaque restitution.",
    icon: Sparkles,
    image: "/images/machine-splash.jpg",
  },
  {
    title: "Caisse fiable",
    description:
      "Calcul automatique des acomptes, soldes et clôture journalière par mode de paiement.",
    icon: Wallet,
    image: "/images/fresh-fold.jpg",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}