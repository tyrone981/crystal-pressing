"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, AlertTriangle } from "lucide-react";

interface CommandeListe {
  id_commande: number;
  code_ticket: string;
  date_depot: string;
  date_retrait_prevue: string;
  statut_global: string;
  montant_total_cfa: number;
  nom_client: string;
  telephone: string;
}

const STATUT_STYLE: Record<string, string> = {
  EN_COURS: "bg-secondary text-secondary-foreground",
  PRET: "bg-primary/15 text-primary-dark",
  LIVRE: "bg-green-100 text-green-700",
  EN_SOUFFRANCE: "bg-destructive/15 text-destructive",
};

const STATUT_LABEL: Record<string, string> = {
  EN_COURS: "En cours",
  PRET: "Prêt",
  LIVRE: "Livré",
  EN_SOUFFRANCE: "En souffrance",
};

export default function CommandesPage() {
  const [recherche, setRecherche] = useState("");
  const [commandes, setCommandes] = useState<CommandeListe[]>([]);
  const [chargement, setChargement] = useState(false);

  async function chercher(valeur: string) {
    setChargement(true);
    const res = await fetch(`/api/commandes?q=${encodeURIComponent(valeur)}`);
    const data = await res.json();
    setCommandes(data.commandes ?? []);
    setChargement(false);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (recherche.length >= 2) {
        chercher(recherche);
      } else if (recherche.length === 0) {
        chercher("TK-");
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [recherche]);

  useEffect(() => {
    chercher("TK-");
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Commandes</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par numéro de ticket ou téléphone"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="pl-9"
        />
      </div>

      {chargement && (
        <p className="text-sm text-muted-foreground">Recherche...</p>
      )}

      <div className="space-y-2">
        {commandes.map((c) => (
          <Link key={c.id_commande} href={`/commandes/${c.id_commande}`}>
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {c.code_ticket}
                    </p>
                    {c.statut_global === "EN_SOUFFRANCE" && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.nom_client} — {c.telephone}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={STATUT_STYLE[c.statut_global]}>
                    {STATUT_LABEL[c.statut_global]}
                  </Badge>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {c.montant_total_cfa} F
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {!chargement && commandes.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aucune commande trouvée
          </p>
        )}
      </div>
    </div>
  );
}