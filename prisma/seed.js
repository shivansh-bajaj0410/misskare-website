// Optional: creates one demo account so you can test sign-in without
// going through the signup form. Run with: npm run seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@misskare.test" },
    update: {},
    create: {
      email: "demo@misskare.test",
      passwordHash,
      name: "Demo Shopper",
    },
  });
  console.log("Seeded demo user:", user.email, "(password: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
