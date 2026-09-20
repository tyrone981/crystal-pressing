"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [idUtilisateur, setIdUtilisateur] = useState("");
  const [codePin, setCodePin] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    fetch("/api/utilisateurs")
      .then((res) => res.json())
      .then((data) => setUtilisateurs(data.utilisateurs ?? []))
      .catch(() => toast.error("Impossible de charger la liste des agents"));
  }, []);

  async function seConnecter() {
    setEnvoi(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_utilisateur: Number(idUtilisateur),
          code_pin: codePin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Connexion échouée");
        setEnvoi(false);
        return;
      }
      toast.success(`Bienvenue ${data.nom}`);
      router.push("/reception");
    } catch {
      toast.error("Erreur réseau");
      setEnvoi(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary-dark px-6">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo.png"
            alt="Crystal Pressing"
            width={56}
            height={56}
            className="rounded-xl"
          />
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Espace agent
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <Label>Agent</Label>
            <Select value={idUtilisateur} onValueChange={(value) => setIdUtilisateur(value ?? "")}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Sélectionner votre nom" />
              </SelectTrigger>
              <SelectContent>
                {utilisateurs.map((u) => (
                  <SelectItem key={u.id_utilisateur} value={String(u.id_utilisateur)}>
                    {u.nom} — {u.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Code PIN</Label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                inputMode="numeric"
                maxLength={10}
                value={codePin}
                onChange={(e) => setCodePin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && seConnecter()}
                className="pl-9"
                placeholder="••••"
              />
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={seConnecter}
            disabled={!idUtilisateur || !codePin || envoi}
          >
            {envoi ? "Connexion..." : "Se connecter"}
          </Button>
        </div>
      </div>
    </div>
  );
}