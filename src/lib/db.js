import { Pool } from "pg";

const globalForDb = globalThis;

export const db =
  globalForDb.__tdmPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__tdmPool = db;
