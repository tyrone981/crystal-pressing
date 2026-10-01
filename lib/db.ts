import mysql from "mysql2/promise";

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

function buildPool(): mysql.Pool {
  if (process.env.DATABASE_URL) {
    return mysql.createPool({
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      dateStrings: false,
      timezone: "+01:00",
    });
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      process.env.DB_HOST && process.env.DB_HOST !== "localhost"
        ? { rejectUnauthorized: false }
        : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
    dateStrings: false,
    timezone: "+01:00",
  });
}

export const pool = global.mysqlPool ?? buildPool();

if (process.env.NODE_ENV !== "production") global.mysqlPool = pool;

export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function execute(
  sql: string,
  params: any[] = []
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
