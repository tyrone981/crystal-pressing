USE crystal_pressing;

INSERT INTO types_vetement (libelle, categorie, prix_base_cfa) VALUES
('Chemise homme', 'HOMME', 500.00),
('Pantalon homme', 'HOMME', 700.00),
('Veste / Blazer', 'HOMME', 1500.00),
('Costume 2 pièces', 'HOMME', 3000.00),
('T-shirt', 'HOMME', 400.00),
('Boubou Bazin Riche', 'HOMME', 3000.00),
('Boubou simple', 'HOMME', 1500.00),
('Robe simple', 'FEMME', 1500.00),
('Robe de soirée', 'FEMME', 3500.00),
('Robe Wax', 'FEMME', 2000.00),
('Jupe', 'FEMME', 700.00),
('Ensemble tailleur', 'FEMME', 2500.00),
('Vêtement enfant', 'ENFANT', 300.00),
('Uniforme scolaire', 'ENFANT', 500.00),
('Couette / Couverture', 'MAISON_LOURD', 2500.00),
('Rideau', 'MAISON_LOURD', 2000.00),
('Drap de lit', 'MAISON_LOURD', 1000.00);

INSERT INTO services (nom_service, majoration_pct, delai_standard_h) VALUES
('Lavage + Repassage', 0.00, 48),
('Repassage seul', 0.00, 24),
('Nettoyage à sec', 20.00, 48),
('Détachage spécifique', 30.00, 48);

INSERT INTO utilisateurs (nom, role, code_pin_hash) VALUES
('Gérant Principal', 'GERANT', '$2b$10$kjQ/o3c1APYknL.V/YiAd.vMjlSn7k0Ov13GQeGwfgKRT9kFEswsy'),
('Agent Réception', 'RECEPTION', '$2b$10$kjQ/o3c1APYknL.V/YiAd.vMjlSn7k0Ov13GQeGwfgKRT9kFEswsy'),
('Agent Lavage', 'LAVAGE', '$2b$10$kjQ/o3c1APYknL.V/YiAd.vMjlSn7k0Ov13GQeGwfgKRT9kFEswsy'),
('Agent Repassage', 'REPASSAGE', '$2b$10$kjQ/o3c1APYknL.V/YiAd.vMjlSn7k0Ov13GQeGwfgKRT9kFEswsy');