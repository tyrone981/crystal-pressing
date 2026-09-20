"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn } from "@/components/ateliers/kanban-column";
import { cn } from "@/lib/utils";

interface ArticleKanban {
  id_article: number;
  couleur: string;
  statut_etape: string;
  etat_initial: string | null;
  code_ticket: string;
  libelle_type: string;
  nom_client: string;
}

const PROCHAIN_STATUT: Record<string, string> = {
  RECEPTION: "LAVAGE",
  LAVAGE: "REPASSAGE",
  REPASSAGE: "PRET",
};

const LABEL_ACTION: Record<string, string> = {
  RECEPTION: "Lavage",
  LAVAGE: "Repassage",
  REPASSAGE: "Prêt",
};

const ONGLETS = [
  { statut: "RECEPTION", titre: "En attente lavage" },
  { statut: "LAVAGE", titre: "En lavage" },
  { statut: "REPASSAGE", titre: "En repassage" },
  { statut: "PRET", titre: "Prêt au retrait" },
];

export default function AteliersPage() {
  const [articles, setArticles] = useState<ArticleKanban[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState("RECEPTION");

  async function charger() {
    const res = await fetch("/api/ateliers");
    const data = await res.json();
    setArticles(data.articles ?? []);
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function avancer(id: number) {
    const article = articles.find((a) => a.id_article === id);
    if (!article) return;
    const prochain = PROCHAIN_STATUT[article.statut_etape];
    if (!prochain) return;

    const res = await fetch(`/api/articles/${id}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut_etape: prochain, id_utilisateur: 1 }),
    });

    if (res.ok) {
      toast.success(`${article.code_ticket} → ${prochain}`);
      charger();
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  if (chargement) {
    return (
      <div className="px-6 py-10 text-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  const parStatut = (statut: string) =>
    articles.filter((a) => a.statut_etape === statut);

  return (
    <div className="px-4 py-8 md:px-6 md:py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Suivi des ateliers
      </h1>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 md:hidden">
        {ONGLETS.map((o) => (
          <button
            key={o.statut}
            onClick={() => setOngletActif(o.statut)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              ongletActif === o.statut
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {o.titre} ({parStatut(o.statut).length})
          </button>
        ))}
      </div>

      <div className="md:hidden">
        <KanbanColumn
          title={ONGLETS.find((o) => o.statut === ongletActif)?.titre ?? ""}
          articles={parStatut(ongletActif)}
          onAvancer={avancer}
          labelAction={LABEL_ACTION[ongletActif] ?? ""}
        />
      </div>

      <div className="hidden gap-4 overflow-x-auto pb-4 md:flex">
        <KanbanColumn
          title="En attente lavage"
          articles={parStatut("RECEPTION")}
          onAvancer={avancer}
          labelAction={LABEL_ACTION.RECEPTION}
        />
        <KanbanColumn
          title="En lavage"
          articles={parStatut("LAVAGE")}
          onAvancer={avancer}
          labelAction={LABEL_ACTION.LAVAGE}
        />
        <KanbanColumn
          title="En repassage"
          articles={parStatut("REPASSAGE")}
          onAvancer={avancer}
          labelAction={LABEL_ACTION.REPASSAGE}
        />
        <KanbanColumn
          title="Prêt au retrait"
          articles={parStatut("PRET")}
          onAvancer={avancer}
          labelAction=""
        />
      </div>
    </div>
  );
}