import { db } from "../src/lib/db";
async function main(){
  await db.wireItemCountry.deleteMany();
  const { count } = await db.wireItem.deleteMany();
  await db.source.updateMany({ data: { lastFetchedAt: null } });
  console.log(`cleared ${count} wire items`);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>db.$disconnect());