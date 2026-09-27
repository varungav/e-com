// Promotes a user (by email) to admin in public.profiles.
// Usage: DATABASE_URL="..." node scripts/promote-admin.mjs someone@example.com
import { Client } from "pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/promote-admin.mjs <email>");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const { rows } = await client.query(
    `update public.profiles
     set role = 'admin'
     where id = (select id from auth.users where email = $1)
     returning id, role`,
    [email]
  );
  if (rows.length === 0) {
    console.error(`No user found with email ${email}. Have they signed up yet?`);
    process.exitCode = 1;
  } else {
    console.log(`✅ ${email} is now: ${rows[0].role}`);
  }
} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
