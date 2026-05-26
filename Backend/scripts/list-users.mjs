import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const users = await prisma.user.findMany({
  select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  orderBy: { createdAt: "desc" },
  take: 10,
});
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
