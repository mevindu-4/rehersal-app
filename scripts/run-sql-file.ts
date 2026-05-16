/**
 * Run a SQL migration file against Supabase Postgres (requires DATABASE_URL).
 * Usage: npm run db:sql -- supabase/migrations/007_fix_public_figure_library.sql
 */
import { readFile } from "fs/promises";
import path from "path";
import pg from "pg";

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    throw new Error(
      "Usage: npm run db:sql -- supabase/migrations/007_fix_public_figure_library.sql"
    );
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL in .env.local (Supabase → Settings → Database → Connection string → URI)"
    );
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  const sql = await readFile(filePath, "utf-8");

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query(sql);
    console.log(`Ran ${fileArg}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
