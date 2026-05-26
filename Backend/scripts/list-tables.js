import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tables = await prisma.$queryRaw`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log("Tables in public schema:");
for (const row of tables) {
  console.log(" -", row.table_name);
}

const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
console.log("\nCategory table rows:", categories.length);
for (const c of categories) {
  console.log(`  ${c.id} | ${c.label}`);
}

await prisma.$disconnect();
