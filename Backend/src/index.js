import "dotenv/config";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  await prisma.$connect();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Saliah API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
