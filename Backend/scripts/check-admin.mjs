import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: "admin@saliahfoods.com" } });
console.log(user ? { email: user.email, role: user.role, hasPassword: Boolean(user.passwordHash) } : "NOT FOUND");
await prisma.$disconnect();
