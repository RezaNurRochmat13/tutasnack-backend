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

const stores = [
  { name: "Angkringan Pak Mukri", description: "Angkringan", address: "Jalan Sinduadi Mlati Sleman Yogyakarta" },
  { name: "Angkringan Pak Gugum", description: "Angkringan", address: "Jalan Bantul Warung, Bantul, Bantul Yogyakarta" },
  { name: "Lotek Shabrina", description: "Lotek", address: "Jalan Pelaihari Sinduadi Mlati Sleman Yogyakarta" },
  { name: "Mie Ayam Pak Ridwan", description: "Mie Ayam", address: "Jalan Mayjend Sutoyo Bantul Yogyakarta" },
  { name: "Ayam Goreng Pendowo Limo", description: "Warung Makan Pendowo Limo", address: "Jalan Jenderal Sudirman Bantul Yogyakarta" },
]

async function seed() {
  for (const u of users) {
    const hashed = await hashPassword(u.password)
    const result = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, password: hashed },
    })
    console.log("Seeded user:", result.email)
  }

  for (const s of stores) {
    const existing = await prisma.store.findFirst({ where: { name: s.name } })
    if (!existing) {
      const result = await prisma.store.create({ data: s })
      console.log("Seeded store:", result.name)
    } else {
      console.log("Store already exists:", existing.name)
    }
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
