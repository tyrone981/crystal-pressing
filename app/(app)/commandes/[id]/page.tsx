"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface DetailCommande {
  commande: {
    id_commande: number;
    code_ticket: string;
    nom_complet: string;
    telephone: string;
    date_depot: string;
    date_retrait_prevue: string;
    statut_global: string;
    montant_total_cfa: number;
    est_express: boolean;
  };
  articles: {
    id_article: number;
    libelle_type: string;
    nom_service: string;
    couleur: string;
    statut_etape: string;
    etat_initial: string | null;
    montant_ligne_cfa: number;
  }[];
  accessoires: {
    id_accessoire: number;
    type_accessoire: string;
    est_restitue: boolean;
    id_article: number;
  }[];
  paiements: {
    id_paiement: number;
    montant_cfa: number;
    mode_reglement: string;
    date_paiement: string;
  }[];
  reste_a_payer: number;
}

export default function DetailCommandePage() {
  const params = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<DetailCommande | null>(null);

  useEffect(() => {
    fetch(`/api/commandes/${params.id}`)
      .then((res) => res.json())
      .then((data) => setDetail(data));
  }, [params.id]);

  if (!detail) {
    return (
      <div className="px-6 py-10 text-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  const joursDepuisDepot = Math.floor(
    (Date.now() - new Date(detail.commande.date_depot).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <Button variant="ghost" size="sm" onClick={() => router.push("/commandes")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {detail.commande.code_ticket}
        </h1>
        <Badge>{detail.commande.statut_global}</Badge>
      </div>

      {joursDepuisDepot > 30 && detail.commande.statut_global !== "LIVRE" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          En souffrance depuis {joursDepuisDepot} jours (RG-16)
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-foreground">
            {detail.commande.nom_complet}
          </p>
          <p className="text-sm text-muted-foreground">
            {detail.commande.telephone}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {detail.articles.map((a) => (
            <div key={a.id_article} className="border-b border-border pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">
                  {a.libelle_type} — {a.couleur}
                </p>
                <Badge variant="secondary">{a.statut_etape}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{a.nom_service}</p>
              {a.etat_initial && (
                <p className="mt-1 text-sm text-destructive">
                  Anomalie : {a.etat_initial}
                </p>
              )}
              <p className="mt-1 text-sm font-medium">{a.montant_ligne_cfa} F</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {detail.accessoires.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accessoires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {detail.accessoires.map((acc) => (
              <div key={acc.id_accessoire} className="flex justify-between text-sm">
                <span>{acc.type_accessoire}</span>
                <span className={acc.est_restitue ? "text-green-600" : "text-muted-foreground"}>
                  {acc.est_restitue ? "Restitué" : "En attente"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paiements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {detail.paiements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun paiement enregistré</p>
          ) : (
            detail.paiements.map((p) => (
              <div key={p.id_paiement} className="flex justify-between text-sm">
                <span>{p.mode_reglement}</span>
                <span className="font-medium">{p.montant_cfa} F</span>
              </div>
            ))
          )}
          <div className="border-t border-border pt-2">
            <div className="flex justify-between font-bold">
              <span>Reste à payer</span>
              <span className={detail.reste_a_payer > 0 ? "text-destructive" : "text-green-600"}>
                {detail.reste_a_payer} F
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}