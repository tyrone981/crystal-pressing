import mysql, { type ExecuteValues } from "mysql2/promise";

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

export const pool =
  global.mysqlPool ??
  mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
    dateStrings: false,
    timezone: "+01:00",
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