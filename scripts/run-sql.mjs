// Runs a .sql file against your Supabase Postgres database directly.
//
// Usage:
//   DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" node scripts/run-sql.mjs supabase/schema.sql
//
// Get the connection string from: Supabase Dashboard > Project Settings > Database > Connection string (URI).
import { readFileSync } from "node:fs";
import { Client } from "pg";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-sql.mjs <path-to-sql-file>");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL environment variable.");
  console.error("Get it from: Supabase Dashboard > Project Settings > Database > Connection string (URI).");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`Connected. Running ${file} ...`);
  await client.query(sql);
  console.log("✅ Success.");
} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
