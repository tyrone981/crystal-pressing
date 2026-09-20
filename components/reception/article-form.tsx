"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { TypeVetement, Service, NouvelArticleInput } from "@/lib/types";

interface ArticleFormProps {
  types: TypeVetement[];
  services: Service[];
  onAdd: (article: NouvelArticleInput) => void;
}

export function ArticleForm({ types, services, onAdd }: ArticleFormProps) {
  const [idType, setIdType] = useState("");
  const [idService, setIdService] = useState("");
  const [couleur, setCouleur] = useState("");
  const [marque, setMarque] = useState("");
  const [etatInitial, setEtatInitial] = useState("");
  const [accessoires, setAccessoires] = useState
  <
    { type_accessoire: string; quantite: number }[]
  >([]);

  function ajouterAccessoire() {
    setAccessoires((courants) => [...courants, { type_accessoire: "", quantite: 1 }]);
  }

  function supprimerAccessoire(index: number) {
    setAccessoires((courants) => courants.filter((_, i) => i !== index));
  }

  function soumettre() {
    if (!idType || !idService || !couleur) return;
    onAdd({
      id_type: Number(idType),
      id_service: Number(idService),
      couleur,
      marque: marque || undefined,
      etat_initial: etatInitial || undefined,
      accessoires: accessoires
        .filter((a) => a.type_accessoire.trim() && Number.isInteger(a.quantite) && a.quantite > 0)
        .map((a) => ({ ...a, type_accessoire: a.type_accessoire.trim() })),
    });
    setIdType("");
    setIdService("");
    setCouleur("");
    setMarque("");
    setEtatInitial("");
    setAccessoires([]);
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Type de vetement</Label>
          <Select value={idType} onValueChange={(value) => setIdType(value ?? "")}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selectionner" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t.id_type} value={String(t.id_type)}>
                  {t.libelle} - {t.prix_base_cfa} F
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Service</Label>
          <Select value={idService} onValueChange={(value) => setIdService(value ?? "")}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selectionner" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id_service} value={String(s.id_service)}>
                  {s.nom_service}
                  {Number(s.majoration_pct) > 0 ? " (+" + s.majoration_pct + "%)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Couleur</Label>
          <Input
            value={couleur}
            onChange={(e) => setCouleur(e.target.value)}
            placeholder="Bleu roi"
          />
        </div>
        <div>
          <Label>Marque (optionnel)</Label>
          <Input
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            placeholder="Zara"
          />
        </div>
      </div>

      <div>
        <Label>Anomalie / etat initial</Label>
        <Textarea
          value={etatInitial}
          onChange={(e) => setEtatInitial(e.target.value)}
          placeholder="Tache huile col, bouton manquant..."
          className="mt-1.5"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Accessoires</Label>
          <Button type="button" variant="ghost" size="sm" onClick={ajouterAccessoire}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Ajouter
          </Button>
        </div>
        {accessoires.map((acc, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Ceinture tissu"
              value={acc.type_accessoire}
              onChange={(e) => {
                setAccessoires((courants) =>
                  courants.map((courant, index) =>
                    index === i ? { ...courant, type_accessoire: e.target.value } : courant
                  )
                );
              }}
            />
            <Input
              type="number"
              min={1}
              className="w-20"
              value={acc.quantite}
              onChange={(e) => {
                const quantite = Number(e.target.value);
                setAccessoires((courants) =>
                  courants.map((courant, index) =>
                    index === i ? { ...courant, quantite: quantite || 0 } : courant
                  )
                );
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => supprimerAccessoire(i)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={soumettre}
        className="w-full"
        disabled={!idType || !idService || !couleur}
      >
        Ajouter l&apos;article
      </Button>
    </div>
  );
}
