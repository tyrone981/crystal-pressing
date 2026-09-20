import bcrypt from "bcryptjs";

const pin = "1234";
const hash = await bcrypt.hash(pin, 10);
console.log(hash);