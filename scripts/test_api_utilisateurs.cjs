require("dotenv").config({ path: "C:/Users/yvanl/df project/crystal-pressing/.env.local" });
const { pool } = require("C:/Users/yvanl/df project/crystal-pressing/lib/db.ts");

async function testApiUtilisateurs() {
  try {
    const [rows] = await pool.execute("SELECT id_utilisateur, nom, role FROM utilisateurs WHERE est_actif = TRUE ORDER BY role");
    console.log("TEST SUCCESSFUL! Users retrieved from Aiven:", rows);
    await pool.end();
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  }
}
testApiUtilisateurs();
