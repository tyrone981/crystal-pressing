import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ArticleKanban {
  id_article: number;
  couleur: string;
  statut_etape: string;
  etat_initial: string | null;
  code_ticket: string;
  libelle_type: string;
  nom_client: string;
}

interface KanbanColumnProps {
  title: string;
  articles: ArticleKanban[];
  onAvancer: (id: number) => void;
  labelAction: string;
}

export function KanbanColumn({
  title,
  articles,
  onAvancer,
  labelAction,
}: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary">{articles.length}</Badge>
      </div>
      <div className="space-y-2">
        {articles.map((article) => (
          <button
            key={article.id_article}
            onClick={() => onAvancer(article.id_article)}
            className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {article.code_ticket}
              </span>
              {labelAction && (
                <span className="text-xs text-primary">{labelAction} →</span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {article.libelle_type} — {article.couleur}
            </p>
            <p className="text-xs text-muted-foreground">{article.nom_client}</p>
            {article.etat_initial && (
              <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {article.etat_initial}
              </div>
            )}
          </button>
        ))}
        {articles.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucun article
          </p>
        )}
      </div>
    </div>
  );
}