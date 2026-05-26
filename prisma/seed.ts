import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env") })

const prisma = new PrismaClient()

async function seed() {
  const user = await prisma.user.upsert({
    where: { email: "admin@tutasnack.com" },
    update: {},
    create: {
      email: "admin@tutasnack.com",
      name: "Admin",
    },
  })
  console.log("Seeded user:", user)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
