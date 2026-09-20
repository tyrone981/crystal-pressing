"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Banknote, Package, TrendingUp } from "lucide-react";

interface LigneCanal {
  mode_reglement: string;
  nombre: number;
  total_cfa: number;
}

interface StatutCompte {
  statut_global: string;
  nombre: number;
}

interface CommandeSouffrance {
  id_commande: number;
  code_ticket: string;
  nom_complet: string;
  telephone: string;
  jours_ecoules: number;
  montant_total_cfa: number;
}

interface Synthese {
  encaissementsJour: LigneCanal[];
  statutsCommandes: StatutCompte[];
  enSouffrance: CommandeSouffrance[];
  commandesDuJour: number;
}

const CANAL_LABEL: Record<string, string> = {
  ESPECES: "Espèces",
  MOMO_MARCHAND: "MoMo Marchand",
  OM_MARCHAND: "OM Marchand",
};

const STATUT_LABEL: Record<string, string> = {
  EN_COURS: "En cours",
  PRET: "Prêt",
  LIVRE: "Livré",
  EN_SOUFFRANCE: "En souffrance",
};

export default function RapportsPage() {
  const [donnees, setDonnees] = useState<Synthese | null>(null);

  useEffect(() => {
    fetch("/api/rapports/synthese")
      .then((res) => res.json())
      .then(setDonnees);
  }, []);

  if (!donnees) {
    return (
      <div className="px-6 py-10 text-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  const totalJour = donnees.encaissementsJour.reduce(
    (s, l) => s + Number(l.total_cfa),
    0
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Rapports</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Encaissé aujourd&apos;hui</p>
              <p className="text-lg font-bold text-foreground">{totalJour} F</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dépôts aujourd&apos;hui</p>
              <p className="text-lg font-bold text-foreground">{donnees.commandesDuJour}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En souffrance</p>
              <p className="text-lg font-bold text-foreground">{donnees.enSouffrance.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Encaissements du jour par canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {donnees.encaissementsJour.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun paiement enregistré aujourd&apos;hui
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Canal</th>
                  <th className="pb-2">Opérations</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {donnees.encaissementsJour.map((l) => (
                  <tr key={l.mode_reglement} className="border-t border-border">
                    <td className="py-2">{CANAL_LABEL[l.mode_reglement]}</td>
                    <td className="py-2">{l.nombre}</td>
                    <td className="py-2 text-right font-medium">{l.total_cfa} F</td>
                  </tr>
                ))}
                <tr className="border-t border-border font-bold">
                  <td className="py-2">Total</td>
                  <td className="py-2">
                    {donnees.encaissementsJour.reduce((s, l) => s + l.nombre, 0)}
                  </td>
                  <td className="py-2 text-right">{totalJour} F</td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition des commandes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {donnees.statutsCommandes.map((s) => (
            <Badge key={s.statut_global} variant="secondary" className="text-sm">
              {STATUT_LABEL[s.statut_global]} — {s.nombre}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Vêtements en souffrance (+30 jours) — RG-16
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {donnees.enSouffrance.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune commande en souffrance
            </p>
          ) : (
            donnees.enSouffrance.map((c) => (
              <Link
                key={c.id_commande}
                href={`/commandes/${c.id_commande}`}
                className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3 hover:bg-destructive/10"
              >
                <div>
                  <p className="font-medium text-foreground">{c.code_ticket}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.nom_complet} — {c.telephone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-destructive">
                    {c.jours_ecoules} jours
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.montant_total_cfa} F
                  </p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}