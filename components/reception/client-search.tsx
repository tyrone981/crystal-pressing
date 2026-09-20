"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import type { Client } from "@/lib/types";

interface ClientSearchProps {
  onSelect: (client: Client) => void;
}

export function ClientSearch({ onSelect }: ClientSearchProps) {
  const [telephone, setTelephone] = useState("");
  const [resultats, setResultats] = useState<Client[]>([]);
  const [recherche, setRecherche] = useState(false);
  const [creationMode, setCreationMode] = useState(false);
  const [nomComplet, setNomComplet] = useState("");
  const [quartier, setQuartier] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function rechercher() {
    if (telephone.length < 3) return;
    setRecherche(true);
    try {
      const res = await fetch(`/api/clients?telephone=${telephone}`);
      const data = await res.json();
      setResultats(data.clients ?? []);
    } catch {
      toast.error("Erreur reseau lors de la recherche");
    }
    setRecherche(false);
  }

  async function creerClient() {
    if (!nomComplet || telephone.length < 9) {
      toast.error("Nom et telephone valide requis");
      return;
    }
    setEnvoi(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom_complet: nomComplet, telephone, quartier }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la creation du client");
        setEnvoi(false);
        return;
      }
      toast.success("Client cree");
      onSelect({
        id_client: data.id_client,
        nom_complet: nomComplet,
        telephone,
        quartier: quartier || "Douala",
        date_creation: new Date(),
      });
    } catch {
      toast.error("Erreur reseau lors de la creation");
    }
    setEnvoi(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="telephone">Telephone du client</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            id="telephone"
            placeholder="6XXXXXXXX"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && rechercher()}
          />
          <Button onClick={rechercher} disabled={recherche} variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {resultats.length > 0 && (
        <div className="space-y-2 rounded-lg border border-border bg-secondary/40 p-2">
          {resultats.map((client) => (
            <button
              key={client.id_client}
              onClick={() => onSelect(client)}
              className="flex w-full items-center justify-between rounded-md bg-card px-3 py-2 text-left hover:bg-accent"
            >
              <div>
                <p className="font-medium text-foreground">{client.nom_complet}</p>
                <p className="text-sm text-muted-foreground">
                  {client.telephone} - {client.quartier}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {telephone.length >= 9 && resultats.length === 0 && !creationMode && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setCreationMode(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau client - {telephone}
        </Button>
      )}

      {creationMode && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div>
            <Label htmlFor="nom">Nom complet</Label>
            <Input
              id="nom"
              value={nomComplet}
              onChange={(e) => setNomComplet(e.target.value)}
              placeholder="Jean-Paul Mballa"
            />
          </div>
          <div>
            <Label htmlFor="quartier">Quartier</Label>
            <Input
              id="quartier"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              placeholder="Akwa"
            />
          </div>
          <Button onClick={creerClient} className="w-full" disabled={!nomComplet || envoi}>
            {envoi ? "Creation..." : "Creer le client"}
          </Button>
        </div>
      )}
    </div>
  );
}
