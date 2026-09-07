const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Client } = require("pg");

const MIGRATIONS_DIR = path.join(process.cwd(), "database", "migrations");
const LOCK_ID = 2026090701;

function checksum(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida.");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [LOCK_ID]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    for (const filename of files) {
      const fullPath = path.join(MIGRATIONS_DIR, filename);
      const sql = fs.readFileSync(fullPath, "utf8");
      const currentChecksum = checksum(sql);
      const existing = await client.query(
        "SELECT checksum FROM schema_migrations WHERE filename = $1",
        [filename]
      );

      if (existing.rowCount) {
        if (existing.rows[0].checksum !== currentChecksum) {
          throw new Error(`La migración ${filename} fue modificada después de aplicarse.`);
        }
        console.log(`✓ ${filename} ya aplicada`);
        continue;
      }

      console.log(`→ Aplicando ${filename}`);
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
        [filename, currentChecksum]
      );
      console.log(`✓ ${filename} aplicada`);
    }

    await client.query("COMMIT");
    console.log("Migraciones completadas correctamente.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Error ejecutando migraciones:", error.message);
  process.exit(1);
});
