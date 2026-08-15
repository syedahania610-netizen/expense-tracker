import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
  var _drizzleDb: NodePgDatabase<typeof schema> | undefined;
}

// Check if PostgreSQL (Supabase / Postgres connection string or env vars) are provided
export const isPostgresConfigured = Boolean(
  process.env.DATABASE_URL || 
  process.env.SUPABASE_DB_URL || 
  (process.env.SQL_HOST && process.env.SQL_DB_NAME && process.env.SQL_USER)
);

export const createPool = (): Pool | null => {
  if (!isPostgresConfigured) {
    return null;
  }

  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

export const getDb = (): NodePgDatabase<typeof schema> | null => {
  if (!isPostgresConfigured) {
    return null;
  }
  if (!global._drizzleDb) {
    const pool = createPool();
    if (pool) {
      global._drizzleDb = drizzle(pool, { schema });
    }
  }
  return global._drizzleDb || null;
};
