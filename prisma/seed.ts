import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import { resolve } from "path"
import { hashPassword } from "../src/lib/password"

config({ path: resolve(__dirname, "../.env") })

const prisma = new PrismaClient()

const users = [
  {
    email: "admin@tutasnack.com",
    name: "Admin",
    password: "admin123",
  },
  {
    email: "user@tutasnack.com",
    name: "User",
    password: "user123",
  },
]

async function seed() {
  for (const u of users) {
    const hashed = await hashPassword(u.password)
    const result = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, password: hashed },
    })
    console.log("Seeded:", result.email)
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
