"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2 } from "lucide-react";

interface CommandeRecherche {
  id_commande: number;
  code_ticket: string;
  nom_client: string;
  telephone: string;
  statut_global: string;
  montant_total_cfa: number;
}

interface DetailCommande {
  commande: Record<string, unknown>;
  articles: { id_article: number; libelle_type: string; couleur: string }[];
  accessoires: {
    id_accessoire: number;
    type_accessoire: string;
    est_restitue: boolean;
    id_article: number;
  }[];
  paiements: { montant_cfa: number; mode_reglement: string }[];
  reste_a_payer: number;
}

interface LigneCloture {
  mode_reglement: string;
  nombre: number;
  total_cfa: number;
}

export default function CaissePage() {
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<CommandeRecherche[]>([]);
  const [detail, setDetail] = useState<DetailCommande | null>(null);
  const [montantPaiement, setMontantPaiement] = useState(0);
  const [modeReglement, setModeReglement] = useState("ESPECES");
  const [codeRetrait, setCodeRetrait] = useState("");
  const [retirePar, setRetirePar] = useState("");
  const [cloture, setCloture] = useState<LigneCloture[]>([]);

  useEffect(() => {
    fetch("/api/caisse/cloture")
      .then((res) => res.json())
      .then((data) => setCloture(data.lignes ?? []));
  }, []);

  async function chercher() {
    if (!recherche) return;
    const res = await fetch(`/api/commandes?q=${recherche}`);
    const data = await res.json();
    setResultats(data.commandes ?? []);
  }

  async function ouvrirCommande(id: number) {
    const res = await fetch(`/api/commandes/${id}`);
    const data = await res.json();
    setDetail(data);
    setMontantPaiement(data.reste_a_payer);
  }

  async function enregistrerPaiement() {
    if (!detail) return;
    const res = await fetch(
      `/api/commandes/${detail.commande.id_commande}/paiement`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montant_cfa: montantPaiement,
          mode_reglement: modeReglement,
          id_utilisateur: 1,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    toast.success("Paiement enregistré");
    ouvrirCommande(detail.commande.id_commande as number);
  }

  async function confirmerAccessoire(idAccessoire: number) {
    await fetch(`/api/accessoires/${idAccessoire}`, { method: "PATCH" });
    if (detail) ouvrirCommande(detail.commande.id_commande as number);
  }

  async function livrer() {
    if (!detail) return;
    const res = await fetch(
      `/api/commandes/${detail.commande.id_commande}/livraison`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_retrait: codeRetrait, retire_par: retirePar }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    toast.success("Commande livrée");
    setDetail(null);
    setResultats([]);
    setRecherche("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Caisse</h1>

      {!detail && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Rechercher une commande</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Numéro de ticket ou téléphone"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && chercher()}
              />
              <Button onClick={chercher}>
                <Search className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {resultats.map((c) => (
            <button
              key={c.id_commande}
              onClick={() => ouvrirCommande(c.id_commande)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left hover:border-primary"
            >
              <div>
                <p className="font-medium text-foreground">{c.code_ticket}</p>
                <p className="text-sm text-muted-foreground">
                  {c.nom_client} — {c.telephone}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{c.statut_global}</Badge>
                <p className="mt-1 text-sm font-medium">{c.montant_total_cfa} F</p>
              </div>
            </button>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Clôture du jour</CardTitle>
            </CardHeader>
            <CardContent>
              {cloture.length === 0 ? (
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
                    {cloture.map((l) => (
                      <tr key={l.mode_reglement} className="border-t border-border">
                        <td className="py-2">{l.mode_reglement}</td>
                        <td className="py-2">{l.nombre}</td>
                        <td className="py-2 text-right font-medium">
                          {l.total_cfa} F
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border font-bold">
                      <td className="py-2">Total</td>
                      <td className="py-2">
                        {cloture.reduce((s, l) => s + l.nombre, 0)}
                      </td>
                      <td className="py-2 text-right">
                        {cloture.reduce((s, l) => s + Number(l.total_cfa), 0)} F
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {detail && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{detail.commande.code_ticket as string}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>
              Retour
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Articles</p>
              {detail.articles.map((a) => (
                <p key={a.id_article} className="text-sm">
                  {a.libelle_type} — {a.couleur}
                </p>
              ))}
            </div>

            {detail.accessoires.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Accessoires à vérifier avant remise
                </p>
                {detail.accessoires.map((acc) => (
                  <div
                    key={acc.id_accessoire}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{acc.type_accessoire}</span>
                    {acc.est_restitue ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Restitué
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmerAccessoire(acc.id_accessoire)}
                      >
                        Confirmer restitution
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-medium">
                  {detail.commande.montant_total_cfa as number} F
                </span>
              </div>
              <div className="flex justify-between text-sm text-primary-dark">
                <span>Reste à payer</span>
                <span className="font-bold">{detail.reste_a_payer} F</span>
              </div>
            </div>

            {detail.reste_a_payer > 0 && (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-medium">Encaisser le solde</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    value={montantPaiement}
                    onChange={(e) => setMontantPaiement(Number(e.target.value))}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <select
                    value={modeReglement}
                    onChange={(e) => setModeReglement(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="MOMO_MARCHAND">MoMo Marchand</option>
                    <option value="OM_MARCHAND">OM Marchand</option>
                  </select>
                </div>
                <Button className="w-full" onClick={enregistrerPaiement}>
                  Enregistrer le paiement
                </Button>
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium">Retrait — code secret</p>
              <Input
                placeholder="Code à 4 chiffres"
                value={codeRetrait}
                onChange={(e) => setCodeRetrait(e.target.value)}
              />
              <Input
                placeholder="Retiré par (optionnel, si tiers)"
                value={retirePar}
                onChange={(e) => setRetirePar(e.target.value)}
              />
              <Button
                className="w-full"
                variant="secondary"
                disabled={!codeRetrait}
                onClick={livrer}
              >
                Valider la livraison
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}