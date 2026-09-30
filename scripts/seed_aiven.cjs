const fs = require('fs');
const mysql = require('mysql2/promise');

const envFile = fs.readFileSync('C:/Users/yvanl/df project/crystal-pressing/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k] = v.join('=');
});

async function runSeed() {
  console.log('Connecting to Aiven MySQL...');
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connected! Checking existing data...');
  const [existingTypes] = await conn.query('SELECT COUNT(*) as c FROM types_vetement');
  if (existingTypes[0].c === 0) {
    console.log('Inserting types_vetement...');
    await conn.query(`
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
      ('Drap de lit', 'MAISON_LOURD', 1000.00)
    `);
    console.log('17 types_vetement inserted.');
  }

  const [existingServices] = await conn.query('SELECT COUNT(*) as c FROM services');
  if (existingServices[0].c === 0) {
    console.log('Inserting services...');
    await conn.query(`
      INSERT INTO services (nom_service, majoration_pct, delai_standard_h) VALUES
      ('Lavage + Repassage', 0.00, 48),
      ('Repassage seul', 0.00, 24),
      ('Nettoyage à sec', 20.00, 48),
      ('Détachage spécifique', 30.00, 48)
    `);
    console.log('4 services inserted.');
  }

  const [existingUsers] = await conn.query('SELECT COUNT(*) as c FROM utilisateurs');
  if (existingUsers[0].c === 0) {
    console.log('Inserting utilisateurs...');
    // PIN 1234 hash
    const defaultHash = '$2b$10$kjQ/o3c1APYknL.V/YiAd.vMjlSn7k0Ov13GQeGwfgKRT9kFEswsy';
    await conn.query(`
      INSERT INTO utilisateurs (nom, role, code_pin_hash) VALUES
      ('Gérant Principal', 'GERANT', ?),
      ('Agent Réception', 'RECEPTION', ?),
      ('Agent Lavage', 'LAVAGE', ?),
      ('Agent Repassage', 'REPASSAGE', ?)
    `, [defaultHash, defaultHash, defaultHash, defaultHash]);
    console.log('4 utilisateurs inserted.');
  }

  const [u] = await conn.query('SELECT id_utilisateur, nom, role, est_actif FROM utilisateurs');
  console.log('Active utilisateurs on Aiven:', u);
  await conn.end();
  console.log('Seed completed successfully!');
}

runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
