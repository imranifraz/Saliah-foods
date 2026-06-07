import { prisma } from "../src/lib/prisma.js";

const admin = await prisma.admin.findUnique({ where: { email: "admin@saliahfoods.com" } });
console.log(
  admin ? { email: admin.email, hasPassword: Boolean(admin.passwordHash) } : "NOT FOUND"
);
await prisma.$disconnect();
