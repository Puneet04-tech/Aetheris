import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("Renaming authorId to author_id...");
    await sql`ALTER TABLE "questions" RENAME COLUMN "authorId" TO "author_id"`;
    console.log("Renamed authorId.");
  } catch (e: any) {
    console.log("Skipping authorId rename:", e.message);
  }

  try {
    console.log("Changing tags to jsonb...");
    await sql`ALTER TABLE "questions" ALTER COLUMN "tags" DROP DEFAULT`;
    await sql`ALTER TABLE "questions" ALTER COLUMN "tags" TYPE jsonb USING to_jsonb("tags")`;
    console.log("Changed tags to jsonb.");
  } catch (e: any) {
    console.log("Skipping tags conversion:", e.message);
  }

  console.log("Done.");
}
main();
