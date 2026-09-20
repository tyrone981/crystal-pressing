import bcrypt from "bcryptjs";

export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, 10);
}

export async function verifierSecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}