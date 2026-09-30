const fs = require('fs');

const dbContent = `import mysql, { type ExecuteValues } from "mysql2/promise";

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

const host = process.env.DB_HOST || process.env.MYSQL_HOST || "localhost";
const isAiven = host.includes("aivencloud") || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("aivencloud"));

export const pool =
  global.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "crystal_pressing",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
    dateStrings: false,
    timezone: "+01:00",
    ssl: isAiven ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") global.mysqlPool = pool;

export async function query<T>(sql: string, params: ExecuteValues[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function execute(
  sql: string,
  params: ExecuteValues[] = []
): Promise<{ insertId: number; affectedRows: number }> {
  const [result] = await pool.execute(sql, params);
  return result as { insertId: number; affectedRows: number };
}

export async function transaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
`;

fs.writeFileSync("C:/Users/yvanl/df project/crystal-pressing/lib/db.ts", dbContent, "utf8");
console.log("Updated lib/db.ts successfully!");
