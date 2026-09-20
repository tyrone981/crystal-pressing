import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query, transaction } from "@/lib/db";
import { genererCodeRetrait, genererCodeTicket } from "@/lib/codes";
import { hashSecret } from "@/lib/hash-pin";

const NouvelArticleSchema = z.object({
  id_type: z.number().int().positive(),
  id_service: z.number().int().positive(),
  couleur: z.string().trim().min(1).max(40),
  marque: z.string().trim().max(50).optional(),
  etat_initial: z.string().trim().max(65535).optional(),
  accessoires: z.array(
    z.object({
      type_accessoire: z.string().trim().min(1).max(60),
      quantite: z.number().int().positive(),
      description: z.string().trim().max(150).optional(),
    })
  ),
});

const CreateCommandeSchema = z.object({
  id_client: z.number().int().positive(),
  id_utilisateur: z.number().int().positive(),
  est_express: z.boolean(),
  date_retrait_prevue: z.coerce.date(),
  articles: z.array(NouvelArticleSchema).min(1),
  acompte_cfa: z.number().min(0),
  mode_reglement: z.enum(["ESPECES", "MOMO_MARCHAND", "OM_MARCHAND"]),
  reference_transaction: z.string().trim().max(60).optional(),
});

interface CommandeRecherche {
  id_commande: number;
  code_ticket: string;
  date_depot: Date;
  date_retrait_prevue: Date;
  statut_global: string;
  montant_total_cfa: number;
  nom_client: string;
  telephone: string;
}

export async function GET(request: NextRequest) {
  const recherche = request.nextUrl.searchParams.get("q");
  if (!recherche) {
    return NextResponse.json({ commandes: [] });
  }

  const commandes = await query<CommandeRecherche>(
    `SELECT
      c.id_commande, c.code_ticket, c.date_depot, c.date_retrait_prevue,
      c.statut_global, c.montant_total_cfa,
      cl.nom_complet AS nom_client, cl.telephone
     FROM commandes c
     JOIN clients cl ON cl.id_client = c.id_client
     WHERE c.code_ticket LIKE ? OR cl.telephone LIKE ?
     ORDER BY c.date_depot DESC
     LIMIT 20`,
    [`%${recherche}%`, `%${recherche}%`]
  );
  return NextResponse.json({ commandes });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete JSON invalide" }, { status: 400 });
  }

  const parsed = CreateCommandeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.date_retrait_prevue.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "La date de retrait doit être future" },
      { status: 400 }
    );
  }

  try {
    const codeRetrait = genererCodeRetrait();
    const codeRetraitHash = await hashSecret(codeRetrait);
    const codeTicket = await genererCodeTicket();

    const resultat = await transaction(async (conn) => {
      const [clientRows] = await conn.execute(
        "SELECT id_client FROM clients WHERE id_client = ?",
        [data.id_client]
      );
      const [utilisateurRows] = await conn.execute(
        "SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = ? AND est_actif = TRUE",
        [data.id_utilisateur]
      );
      if ((clientRows as unknown[]).length === 0) {
        throw new Error("Client introuvable");
      }
      if ((utilisateurRows as unknown[]).length === 0) {
        throw new Error("Utilisateur introuvable ou inactif");
      }

      const idsTypes = [...new Set(data.articles.map((article) => article.id_type))];
      const idsServices = [...new Set(data.articles.map((article) => article.id_service))];
      const [typeRows] = await conn.query(
        `SELECT id_type, prix_base_cfa FROM types_vetement
         WHERE est_actif = TRUE AND id_type IN (${idsTypes.map(() => "?").join(",")})`,
        idsTypes
      );
      const [serviceRows] = await conn.query(
        `SELECT id_service, majoration_pct FROM services
         WHERE est_actif = TRUE AND id_service IN (${idsServices.map(() => "?").join(",")})`,
        idsServices
      );
      const types = new Map(
        (typeRows as { id_type: number; prix_base_cfa: number }[]).map((row) => [row.id_type, row])
      );
      const services = new Map(
        (serviceRows as { id_service: number; majoration_pct: number }[]).map((row) => [row.id_service, row])
      );
      if (types.size !== idsTypes.length || services.size !== idsServices.length) {
        throw new Error("Type de vêtement ou service invalide");
      }

      const lignes = data.articles.map((article) => {
        const type = types.get(article.id_type)!;
        const service = services.get(article.id_service)!;
        const majoration = Number(service.majoration_pct) + (data.est_express ? 50 : 0);
        const prix = Number(type.prix_base_cfa) * (1 + majoration / 100);
        return { article, prix, majoration };
      });
      const montantTotal = lignes.reduce((total, ligne) => total + ligne.prix, 0);
      if (data.acompte_cfa > montantTotal) {
        throw new Error("L'acompte ne peut pas dépasser le montant total");
      }

      const [commandeResult] = await conn.execute(
        `INSERT INTO commandes
         (code_ticket, code_retrait_hash, date_retrait_prevue, est_express,
          montant_total_cfa, id_client, id_utilisateur)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          codeTicket,
          codeRetraitHash,
          data.date_retrait_prevue,
          data.est_express,
          montantTotal,
          data.id_client,
          data.id_utilisateur,
        ]
      );
      const idCommande = (commandeResult as { insertId: number }).insertId;

      for (const ligne of lignes) {
        const [articleResult] = await conn.execute(
          `INSERT INTO articles_deposes
           (couleur, marque, etat_initial, prix_unitaire_cfa, majoration_pct_appliquee,
            montant_ligne_cfa, id_commande, id_type, id_service)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ligne.article.couleur,
            ligne.article.marque || null,
            ligne.article.etat_initial || null,
            ligne.prix,
            ligne.majoration,
            ligne.prix,
            idCommande,
            ligne.article.id_type,
            ligne.article.id_service,
          ]
        );
        const idArticle = (articleResult as { insertId: number }).insertId;
        for (const accessoire of ligne.article.accessoires) {
          await conn.execute(
            `INSERT INTO accessoires (type_accessoire, quantite, description, id_article)
             VALUES (?, ?, ?, ?)`,
            [accessoire.type_accessoire, accessoire.quantite, accessoire.description || null, idArticle]
          );
        }
      }

      if (data.acompte_cfa > 0) {
        await conn.execute(
          `INSERT INTO paiements
           (montant_cfa, mode_reglement, reference_transaction, id_commande, id_utilisateur)
           VALUES (?, ?, ?, ?, ?)`,
          [data.acompte_cfa, data.mode_reglement, data.reference_transaction || null, idCommande, data.id_utilisateur]
        );
      }

      return {
        code_ticket: codeTicket,
        code_retrait: codeRetrait,
        montant_total_cfa: montantTotal,
        reste_a_payer: montantTotal - data.acompte_cfa,
      };
    });

    return NextResponse.json(resultat, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la création de la commande";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
