DROP DATABASE IF EXISTS crystal_pressing;
CREATE DATABASE crystal_pressing
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crystal_pressing;

CREATE TABLE clients (
  id_client     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom_complet   VARCHAR(100) NOT NULL,
  telephone     VARCHAR(20)  NOT NULL,
  quartier      VARCHAR(100) NOT NULL DEFAULT 'Douala',
  date_creation DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_client),
  UNIQUE KEY uq_clients_telephone (telephone),
  KEY idx_clients_nom (nom_complet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE types_vetement (
  id_type       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  libelle       VARCHAR(80)  NOT NULL,
  categorie     ENUM('HOMME','FEMME','ENFANT','MAISON_LOURD') NOT NULL,
  prix_base_cfa DECIMAL(10,2) NOT NULL,
  est_actif     BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_type),
  UNIQUE KEY uq_types_libelle (libelle),
  CONSTRAINT chk_types_prix CHECK (prix_base_cfa >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE services (
  id_service       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom_service      VARCHAR(60)  NOT NULL,
  majoration_pct   DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  delai_standard_h INT UNSIGNED NOT NULL DEFAULT 48,
  est_actif        BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_service),
  UNIQUE KEY uq_services_nom (nom_service),
  CONSTRAINT chk_services_majoration CHECK (majoration_pct >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE utilisateurs (
  id_utilisateur INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom            VARCHAR(60)  NOT NULL,
  role           ENUM('RECEPTION','LAVAGE','REPASSAGE','GERANT') NOT NULL,
  code_pin_hash  VARCHAR(255) NOT NULL,
  est_actif      BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_utilisateur),
  KEY idx_utilisateurs_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE commandes (
  id_commande         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code_ticket         VARCHAR(30)  NOT NULL,
  code_retrait_hash   VARCHAR(255) NOT NULL,
  date_depot          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_retrait_prevue DATETIME     NOT NULL,
  date_retrait_reel   DATETIME     NULL,
  est_express         BOOLEAN      NOT NULL DEFAULT FALSE,
  montant_total_cfa   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  statut_global       ENUM('EN_COURS','PRET','LIVRE','EN_SOUFFRANCE') NOT NULL DEFAULT 'EN_COURS',
  retire_par          VARCHAR(100) NULL,
  id_client           INT UNSIGNED NOT NULL,
  id_utilisateur      INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_commande),
  UNIQUE KEY uq_commandes_ticket (code_ticket),
  KEY idx_commandes_statut_depot (statut_global, date_depot),
  KEY idx_commandes_depot (date_depot),
  CONSTRAINT fk_commandes_client
    FOREIGN KEY (id_client) REFERENCES clients (id_client)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_commandes_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_commandes_montant CHECK (montant_total_cfa >= 0),
  CONSTRAINT chk_commandes_dates CHECK (date_retrait_prevue >= date_depot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE articles_deposes (
  id_article               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  couleur                  VARCHAR(40)  NOT NULL,
  marque                   VARCHAR(50)  NULL,
  etat_initial             TEXT         NULL,
  emplacement_portant      VARCHAR(30)  NULL,
  statut_etape             ENUM('RECEPTION','LAVAGE','REPASSAGE','PRET','LIVRE') NOT NULL DEFAULT 'RECEPTION',
  prix_unitaire_cfa        DECIMAL(10,2) NOT NULL,
  majoration_pct_appliquee DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  montant_ligne_cfa        DECIMAL(10,2) NOT NULL,
  id_commande              INT UNSIGNED NOT NULL,
  id_type                  INT UNSIGNED NOT NULL,
  id_service               INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_article),
  KEY idx_articles_statut (statut_etape),
  KEY idx_articles_commande (id_commande),
  CONSTRAINT fk_articles_commande
    FOREIGN KEY (id_commande) REFERENCES commandes (id_commande)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_articles_type
    FOREIGN KEY (id_type) REFERENCES types_vetement (id_type)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_articles_service
    FOREIGN KEY (id_service) REFERENCES services (id_service)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_articles_prix CHECK (prix_unitaire_cfa >= 0 AND montant_ligne_cfa >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE etapes_article (
  id_etape       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  etape          ENUM('RECEPTION','LAVAGE','REPASSAGE','PRET','LIVRE') NOT NULL,
  date_entree    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observation    VARCHAR(200) NULL,
  id_article     INT UNSIGNED NOT NULL,
  id_utilisateur INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_etape),
  KEY idx_etapes_article_date (id_article, date_entree),
  CONSTRAINT fk_etapes_article
    FOREIGN KEY (id_article) REFERENCES articles_deposes (id_article)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_etapes_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE accessoires (
  id_accessoire   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type_accessoire VARCHAR(60)  NOT NULL,
  quantite        INT UNSIGNED NOT NULL DEFAULT 1,
  description     VARCHAR(150) NULL,
  est_restitue    BOOLEAN      NOT NULL DEFAULT FALSE,
  id_article      INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_accessoire),
  KEY idx_accessoires_article (id_article),
  CONSTRAINT fk_accessoires_article
    FOREIGN KEY (id_article) REFERENCES articles_deposes (id_article)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_accessoires_quantite CHECK (quantite > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE paiements (
  id_paiement           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  date_paiement         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  montant_cfa           DECIMAL(10,2) NOT NULL,
  mode_reglement        ENUM('ESPECES','MOMO_MARCHAND','OM_MARCHAND') NOT NULL,
  reference_transaction VARCHAR(60)  NULL,
  id_commande           INT UNSIGNED NOT NULL,
  id_utilisateur        INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_paiement),
  KEY idx_paiements_date_mode (date_paiement, mode_reglement),
  KEY idx_paiements_commande (id_commande),
  CONSTRAINT fk_paiements_commande
    FOREIGN KEY (id_commande) REFERENCES commandes (id_commande)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_paiements_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (id_utilisateur)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_paiements_montant CHECK (montant_cfa > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;