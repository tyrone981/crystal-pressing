export type Categorie = "HOMME" | "FEMME" | "ENFANT" | "MAISON_LOURD";
export type RoleUtilisateur = "RECEPTION" | "LAVAGE" | "REPASSAGE" | "GERANT";
export type StatutCommande = "EN_COURS" | "PRET" | "LIVRE" | "EN_SOUFFRANCE";
export type StatutEtape = "RECEPTION" | "LAVAGE" | "REPASSAGE" | "PRET" | "LIVRE";
export type ModeReglement = "ESPECES" | "MOMO_MARCHAND" | "OM_MARCHAND";

export interface Client {
  id_client: number;
  nom_complet: string;
  telephone: string;
  quartier: string;
  date_creation: Date;
}

export interface TypeVetement {
  id_type: number;
  libelle: string;
  categorie: Categorie;
  prix_base_cfa: number;
  est_actif: boolean;
}

export interface Service {
  id_service: number;
  nom_service: string;
  majoration_pct: number;
  delai_standard_h: number;
  est_actif: boolean;
}

export interface Commande {
  id_commande: number;
  code_ticket: string;
  date_depot: Date;
  date_retrait_prevue: Date;
  date_retrait_reel: Date | null;
  est_express: boolean;
  montant_total_cfa: number;
  statut_global: StatutCommande;
  retire_par: string | null;
  id_client: number;
  id_utilisateur: number;
}

export interface ArticleDepose {
  id_article: number;
  couleur: string;
  marque: string | null;
  etat_initial: string | null;
  emplacement_portant: string | null;
  statut_etape: StatutEtape;
  prix_unitaire_cfa: number;
  majoration_pct_appliquee: number;
  montant_ligne_cfa: number;
  id_commande: number;
  id_type: number;
  id_service: number;
}

export interface Accessoire {
  id_accessoire: number;
  type_accessoire: string;
  quantite: number;
  description: string | null;
  est_restitue: boolean;
  id_article: number;
}

export interface Paiement {
  id_paiement: number;
  date_paiement: Date;
  montant_cfa: number;
  mode_reglement: ModeReglement;
  reference_transaction: string | null;
  id_commande: number;
  id_utilisateur: number;
}

export interface NouvelArticleInput {
  id_type: number;
  id_service: number;
  couleur: string;
  marque?: string;
  etat_initial?: string;
  accessoires: { type_accessoire: string; quantite: number; description?: string }[];
}

export interface NouvelleCommandeInput {
  id_client: number;
  id_utilisateur: number;
  est_express: boolean;
  date_retrait_prevue: string;
  articles: NouvelArticleInput[];
  acompte_cfa: number;
  mode_reglement: ModeReglement;
  reference_transaction?: string;
}