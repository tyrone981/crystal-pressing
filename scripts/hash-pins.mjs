import bcrypt from "bcryptjs";
import { writeFileSync } from "fs";

const pins = {
  utilisateur_1_gerant: "1234",
  utilisateur_2_reception: "1111",
  utilisateur_3_lavage: "2222",
  utilisateur_4_repassage: "3333",
};

let output = "";
for (const [label, pin] of Object.entries(pins)) {
  const hash = await bcrypt.hash(pin, 10);
  output += `${label} -> ${hash}\n`;
}

writeFileSync("hash-output.txt", output, "utf-8");
console.log("Fichier hash-output.txt ecrit avec succes");
