"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientSearch } from "@/components/reception/client-search";
import { ArticleForm } from "@/components/reception/article-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Copy } from "lucide-react";
import type {
  Client,
  TypeVetement,
  Service,
  NouvelArticleInput,
  ModeReglement,
} from "@/lib/types";

export default function ReceptionPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [types, setTypes] = useState<TypeVetement[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [articles, setArticles] = useState<NouvelArticleInput[]>([]);
  const [estExpress, setEstExpress] = useState(false);
  const [acompte, setAcompte] = useState(0);
  const [modeReglement, setModeReglement] = useState<ModeReglement>("ESPECES");
  const [resultat, setResultat] = useState<{
    code_ticket: string;
    code_retrait: string;
    montant_total_cfa: number;
    reste_a_payer: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/catalogue")
      .then((res) => res.json())
      .then((data) => {
        setTypes(data.types);
        setServices(data.services);
      });
  }, []);

  const montantEstime = articles.reduce((total, article) => {
    const type = types.find((t) => t.id_type === article.id_type);
    const service = services.find((s) => s.id_service === article.id_service);
    if (!type || !service) return total;
    const majoration = Number(service.majoration_pct) + (estExpress ? 50 : 0);
    return total + Number(type.prix_base_cfa) * (1 + majoration / 100);
  }, 0);

  async function creerCommande() {
    if (!client || articles.length === 0) return;
    const res = await fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_client: client.id_client,
        id_utilisateur: 1,
        est_express: estExpress,
        date_retrait_prevue: new Date(
          Date.now() + (estExpress ? 24 : 48) * 3600 * 1000
        ).toISOString(),
        articles,
        acompte_cfa: acompte,
        mode_reglement: modeReglement,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Erreur lors de la création");
      return;
    }
    setResultat(data);
    toast.success(`Ticket ${data.code_ticket} créé`);
  }

  if (resultat) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Ticket {resultat.code_ticket}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-6">
              <p className="text-sm text-muted-foreground">Code de retrait</p>
              <p className="text-4xl font-bold tracking-widest text-primary-dark">
                {resultat.code_retrait}
              </p>
            </div>
            <div className="space-y-1 text-left text-sm">
              <p>
                Total : <strong>{resultat.montant_total_cfa} FCFA</strong>
              </p>
              <p>
                Reste à payer : <strong>{resultat.reste_a_payer} FCFA</strong>
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(resultat.code_retrait);
                toast.success("Code copié");
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copier le code
            </Button>
            <Button className="w-full" onClick={() => window.location.reload()}>
              Nouveau dépôt
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
     <h1 className="text-2xl font-bold text-foreground">Nouvelle commande</h1>

      {!client ? (
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientSearch onSelect={setClient} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-foreground">{client.nom_complet}</p>
              <p className="text-sm text-muted-foreground">{client.telephone}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setClient(null)}>
              Changer
            </Button>
          </CardContent>
        </Card>
      )}

      {client && (
        <>
          <ArticleForm
            types={types}
            services={services}
            onAdd={(article) => setArticles([...articles, article])}
          />

          {articles.length > 0 && (
            <div className="space-y-2">
              {articles.map((article, i) => {
                const type = types.find((t) => t.id_type === article.id_type);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2"
                  >
                    <span className="text-sm">
                      {type?.libelle} — {article.couleur}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setArticles(articles.filter((_, idx) => idx !== i))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {articles.length > 0 && (
            <Card>
              <CardContent className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total estimé</span>
                  <span className="text-lg font-bold text-primary-dark">
                    {Math.round(montantEstime)} FCFA
                  </span>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={estExpress}
                    onChange={(e) => setEstExpress(e.target.checked)}
                  />
                  Service Express (+50%)
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Acompte (FCFA)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={acompte}
                      onChange={(e) => setAcompte(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Mode de règlement
                    </label>
                    <select
                      value={modeReglement}
                      onChange={(e) =>
                        setModeReglement(e.target.value as ModeReglement)
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="ESPECES">Espèces</option>
                      <option value="MOMO_MARCHAND">MoMo Marchand</option>
                      <option value="OM_MARCHAND">OM Marchand</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={creerCommande}>
                  Créer le ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}