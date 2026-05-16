import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";


const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("Dropping foreign key constraint on comments.post_id...");
    await sql`ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_postId_fkey"`;
    console.log("Constraint dropped.");
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
main();
main();
