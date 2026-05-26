import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import { resolve } from "path"
import { hashPassword } from "../src/lib/password"

config({ path: resolve(__dirname, "../.env") })

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const users = [
  { email: "admin@tutasnack.com", name: "Admin", password: "admin123" },
  { email: "user@tutasnack.com", name: "User", password: "user123" },
]

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------
const stores = [
  { name: "Angkringan Pak Mukri", description: "Angkringan", address: null },
  { name: "Angkringan Pak Gugum", description: "Angkringan", address: null },
  { name: "Lotek Shabrina", description: "Lotek", address: null },
  { name: "Mie Ayam Pak Ridwan", description: "Mie Ayam", address: null },
  { name: "Salon Mbak Nana", description: "Salon", address: null },
  {
    name: "Pendowo 5 Bantul",
    description: "Warung Makan Pendowo",
    address: null,
  },
]

// ---------------------------------------------------------------------------
// Sales Income – helpers
// ---------------------------------------------------------------------------
const MONTHS: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
}

/** "Kamis, 20 Februari 2025" → Date */
function parseDate(raw: string): Date {
  const parts = raw.split(/,\s+| /)
  const day = Number(parts[1])
  const month = MONTHS[parts[2].toLowerCase()]
  const year = Number(parts[3])
  return new Date(year, month, day)
}

/** "Rp14.000,00" → 14000 */
function parseAmount(raw: string): number {
  const cleaned = raw.replace(/^Rp\s*/, "").replace(/\./g, "").replace(",", ".")
  return Math.round(Number(cleaned))
}

// ---------------------------------------------------------------------------
// Sales Income – data   (storeName → salesDate → amount)
// ---------------------------------------------------------------------------
const salesIncomeData: [string, string, string][] = [
  ["Angkringan Pak Mucry", "Kamis, 20 Februari 2025", "Rp14.000,00"],
  ["Lotek Shabrina", "Jumat, 21 Februari 2025", "Rp24.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 22 Februari 2025", "Rp37.500,00"],
  ["Salon Mbak Nana", "Sabtu, 22 Februari 2025", "Rp15.000,00"],
  ["Angkringan Pak Gugum", "Kamis, 27 Februari 2025", "Rp33.000,00"],
  ["Salon Mbak Nana", "Kamis, 27 Februari 2025", "Rp16.500,00"],
  ["Angkringan Pak Mucry", "Jumat, 28 Februari 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Senin, 03 Maret 2025", "Rp22.500,00"],
  ["Angkringan Pak Gugum", "Jumat, 07 Maret 2025", "Rp36.000,00"],
  ["Angkringan Pak Mucry", "Senin, 10 Maret 2025", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Kamis, 13 Maret 2025", "Rp37.500,00"],
  ["Angkringan Pak Mucry", "Minggu, 16 Maret 2025", "Rp22.500,00"],
  ["Angkringan Pak Gugum", "Jumat, 21 Maret 2025", "Rp37.500,00"],
  ["Lotek Shabrina", "Senin, 31 Maret 2025", "Rp31.500,00"],
  ["Angkringan Pak Mucry", "Senin, 31 Maret 2025", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Senin, 31 Maret 2025", "Rp36.000,00"],
  ["Salon Mbak Nana", "Jumat, 18 April 2025", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Jumat, 18 April 2025", "Rp30.000,00"],
  ["Salon Mbak Nana", "Sabtu, 26 April 2025", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 26 April 2025", "Rp33.000,00"],
  ["Angkringan Pak Mucry", "Minggu, 27 April 2025", "Rp24.000,00"],
  ["Lotek Shabrina", "Senin, 28 April 2025", "Rp16.500,00"],
  ["Angkringan Pak Gugum", "Rabu, 30 April 2025", "Rp42.000,00"],
  ["Salon Mbak Nana", "Rabu, 30 April 2025", "Rp36.000,00"],
  ["Angkringan Pak Mucry", "Rabu, 30 April 2025", "Rp28.500,00"],
  ["Lotek Shabrina", "Sabtu, 10 Mei 2025", "Rp27.000,00"],
  ["Salon Mbak Nana", "Sabtu, 10 Mei 2025", "Rp33.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 10 Mei 2025", "Rp40.000,00"],
  ["Angkringan Pak Mucry", "Jumat, 16 Mei 2025", "Rp3.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 17 Mei 2025", "Rp31.500,00"],
  ["Lotek Shabrina", "Selasa, 20 Mei 2025", "Rp20.000,00"],
  ["Angkringan Pak Mucry", "Rabu, 21 Mei 2025", "Rp20.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 27 Mei 2025", "Rp27.000,00"],
  ["Pendowo 5 Bantul", "Rabu, 28 Mei 2025", "Rp27.000,00"],
  ["Salon Mbak Nana", "Rabu, 28 Mei 2025", "Rp37.000,00"],
  ["Angkringan Pak Gugum", "Rabu, 28 Mei 2025", "Rp39.000,00"],
  ["Lotek Shabrina", "Kamis, 05 Juni 2025", "Rp27.000,00"],
  ["Angkringan Pak Mucry", "Jumat, 13 Juni 2025", "Rp18.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 14 Juni 2025", "Rp38.000,00"],
  ["Pendowo 5 Bantul", "Sabtu, 14 Juni 2025", "Rp15.000,00"],
  ["Lotek Shabrina", "Senin, 16 Juni 2025", "Rp24.000,00"],
  ["Salon Mbak Nana", "Sabtu, 21 Juni 2025", "Rp42.000,00"],
  ["Pendowo 5 Bantul", "Sabtu, 28 Juni 2025", "Rp17.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 28 Juni 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Senin, 30 Juni 2025", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 01 Juli 2025", "Rp20.000,00"],
  ["Angkringan Pak Mucry", "Jumat, 11 Juli 2025", "Rp30.000,00"],
  ["Salon Mbak Nana", "Sabtu, 12 Juli 2025", "Rp35.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 12 Juli 2025", "Rp32.000,00"],
  ["Lotek Shabrina", "Senin, 14 Juli 2025", "Rp27.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 15 Juli 2025", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Jumat, 18 Juli 2025", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Sabtu, 26 Juli 2025", "Rp10.000,00"],
  ["Salon Mbak Nana", "Sabtu, 26 Juli 2025", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 26 Juli 2025", "Rp42.000,00"],
  ["Lotek Shabrina", "Senin, 28 Juli 2025", "Rp21.000,00"],
  ["Angkringan Pak Mucry", "Senin, 28 Juli 2025", "Rp35.000,00"],
  ["Angkringan Pak Mucry", "Senin, 11 Agustus 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Selasa, 12 Agustus 2025", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Jumat, 15 Agustus 2025", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Sabtu, 16 Agustus 2025", "Rp18.000,00"],
  ["Salon Mbak Nana", "Sabtu, 16 Agustus 2025", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 16 Agustus 2025", "Rp42.000,00"],
  ["Angkringan Pak Mucry", "Kamis, 21 Agustus 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Rabu, 27 Agustus 2025", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Kamis, 28 Agustus 2025", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 30 Agustus 2025", "Rp42.000,00"],
  ["Salon Mbak Nana", "Sabtu, 30 Agustus 2025", "Rp33.000,00"],
  ["Angkringan Pak Mucry", "Rabu, 03 September 2025", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 09 September 2025", "Rp27.000,00"],
  ["Lotek Shabrina", "Kamis, 11 September 2025", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Jumat, 12 September 2025", "Rp10.000,00"],
  ["Angkringan Pak Gugum", "Jumat, 12 September 2025", "Rp42.000,00"],
  ["Angkringan Pak Mucry", "Jumat, 19 September 2025", "Rp25.000,00"],
  ["Angkringan Pak Mucry", "Minggu, 21 September 2025", "Rp25.000,00"],
  ["Lotek Shabrina", "Jumat, 26 September 2025", "Rp30.000,00"],
  ["Salon Mbak Nana", "Sabtu, 27 September 2025", "Rp40.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 27 September 2025", "Rp42.000,00"],
  ["Angkringan Pak Mucry", "Sabtu, 27 September 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Jumat, 10 Oktober 2025", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Sabtu, 11 Oktober 2025", "Rp6.000,00"],
  ["Salon Mbak Nana", "Sabtu, 11 Oktober 2025", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 11 Oktober 2025", "Rp42.000,00"],
  ["Angkringan Pak Mucry", "Senin, 13 Oktober 2025", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Senin, 20 Oktober 2025", "Rp24.000,00"],
  ["Lotek Shabrina", "Selasa, 21 Oktober 2025", "Rp20.000,00"],
  ["Salon Mbak Nana", "Sabtu, 25 Oktober 2025", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 25 Oktober 2025", "Rp36.000,00"],
  ["Angkringan Pak Mucry", "Rabu, 29 Oktober 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Sabtu, 01 November 2025", "Rp25.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 04 November 2025", "Rp25.000,00"],
  ["Angkringan Pak Gugum", "Jumat, 07 November 2025", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Jumat, 07 November 2025", "Rp6.000,00"],
  ["Salon Mbak Nana", "Jumat, 07 November 2025", "Rp36.000,00"],
  ["Angkringan Pak Mucry", "Minggu, 16 November 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Senin, 17 November 2025", "Rp22.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 22 November 2025", "Rp36.000,00"],
  ["Salon Mbak Nana", "Sabtu, 22 November 2025", "Rp40.000,00"],
  ["Angkringan Pak Mucry", "Senin, 24 November 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Rabu, 26 November 2025", "Rp25.000,00"],
  ["Angkringan Pak Mucry", "Minggu, 30 November 2025", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Sabtu, 06 Desember 2025", "Rp15.000,00"],
  ["Salon Mbak Nana", "Sabtu, 06 Desember 2025", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 06 Desember 2025", "Rp42.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 16 Desember 2025", "Rp30.000,00"],
  ["Lotek Shabrina", "Selasa, 16 Desember 2025", "Rp30.000,00"],
  ["Salon Mbak Nana", "Sabtu, 20 Desember 2025", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 20 Desember 2025", "Rp42.000,00"],
  ["Angkringan Pak Mucry", "Senin, 22 Desember 2025", "Rp19.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 30 Desember 2025", "Rp25.000,00"],
  ["Lotek Shabrina", "Selasa, 30 Desember 2025", "Rp30.000,00"],
  ["Salon Mbak Nana", "Rabu, 31 Desember 2025", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Rabu, 31 Desember 2025", "Rp36.000,00"],
  ["Lotek Shabrina", "Selasa, 13 Januari 2026", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Selasa, 13 Januari 2026", "Rp30.000,00"],
  ["Salon Mbak Nana", "Jumat, 16 Januari 2026", "Rp42.000,00"],
  ["Angkringan Pak Gugum", "Jumat, 16 Januari 2026", "Rp38.000,00"],
  ["Angkringan Pak Mucry", "Sabtu, 24 Januari 2026", "Rp30.000,00"],
  ["Lotek Shabrina", "Senin, 26 Januari 2026", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Sabtu, 31 Januari 2026", "Rp15.000,00"],
  ["Salon Mbak Nana", "Sabtu, 31 Januari 2026", "Rp35.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 31 Januari 2026", "Rp42.000,00"],
  ["Angkringan Pak Mucry", "Senin, 02 Februari 2026", "Rp30.000,00"],
  ["Lotek Shabrina", "Rabu, 04 Februari 2026", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Senin, 16 Februari 2026", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Selasa, 17 Februari 2026", "Rp42.000,00"],
  ["Salon Mbak Nana", "Selasa, 17 Februari 2026", "Rp42.000,00"],
  ["Lotek Shabrina", "Rabu, 18 Februari 2026", "Rp25.000,00"],
  ["Angkringan Pak Mucry", "Sabtu, 28 Februari 2026", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 07 Maret 2026", "Rp30.000,00"],
  ["Angkringan Pak Mucry", "Sabtu, 28 Maret 2026", "Rp30.000,00"],
  ["Lotek Shabrina", "Rabu, 01 April 2026", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 04 April 2026", "Rp36.000,00"],
  ["Angkringan Pak Mucry", "Rabu, 08 April 2026", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 18 April 2026", "Rp40.000,00"],
  ["Lotek Shabrina", "Sabtu, 18 April 2026", "Rp25.000,00"],
  ["Angkringan Pak Mucry", "Sabtu, 18 April 2026", "Rp25.000,00"],
  ["Angkringan Pak Mucry", "Kamis, 23 April 2026", "Rp30.000,00"],
  ["Pendowo 5 Bantul", "Kamis, 30 April 2026", "Rp15.000,00"],
  ["Angkringan Pak Gugum", "Kamis, 30 April 2026", "Rp38.000,00"],
  ["Salon Mbak Nana", "Kamis, 30 April 2026", "Rp28.500,00"],
  ["Angkringan Pak Mucry", "Selasa, 05 Mei 2026", "Rp30.000,00"],
  ["Lotek Shabrina", "Jumat, 15 Mei 2026", "Rp20.000,00"],
  ["Angkringan Pak Mucry", "Jumat, 15 Mei 2026", "Rp30.000,00"],
  ["Angkringan Pak Gugum", "Sabtu, 16 Mei 2026", "Rp33.000,00"],
  ["Salon Mbak Nana", "Sabtu, 16 Mei 2026", "Rp30.000,00"],
]

// ---------------------------------------------------------------------------
// Sales Tracker – data   (storeName → salesDate → saleCount → soldCount)
// ---------------------------------------------------------------------------
const salesTrackerData: [string, string, number, number][] = [
  ["Angkringan Pak Gugum", "Sabtu, 26 April 2025", 30, 30],
  ["Salon Mbak Nana", "Sabtu, 26 April 2025", 30, 24],
  ["Angkringan Pak Mucry", "Minggu, 27 April 2025", 22, 19],
  ["Lotek Shabrina", "Senin, 28 April 2025", 20, 18],
  ["Angkringan Pak Gugum", "Sabtu, 03 Mei 2025", 30, 26],
  ["Salon Mbak Nana", "Sabtu, 03 Mei 2025", 30, 22],
  ["Angkringan Pak Mucry", "Selasa, 06 Mei 2025", 22, 2],
  ["Lotek Shabrina", "Sabtu, 10 Mei 2025", 20, 13],
  ["Angkringan Pak Gugum", "Sabtu, 10 Mei 2025", 30, 21],
  ["Salon Mbak Nana", "Sabtu, 10 Mei 2025", 30, 25],
  ["Angkringan Pak Mucry", "Jumat, 16 Mei 2025", 22, 13],
  ["Angkringan Pak Gugum", "Sabtu, 17 Mei 2025", 30, 26],
  ["Pendowo 5 Bantul", "Sabtu, 17 Mei 2025", 22, 18],
  ["Lotek Shabrina", "Selasa, 20 Mei 2025", 20, 18],
  ["Angkringan Pak Mucry", "Rabu, 21 Mei 2025", 22, 18],
  ["Angkringan Pak Mucry", "Selasa, 27 Mei 2025", 22, 12],
  ["Pendowo 5 Bantul", "Rabu, 28 Mei 2025", 22, 10],
  ["Salon Mbak Nana", "Rabu, 28 Mei 2025", 30, 28],
  ["Angkringan Pak Gugum", "Rabu, 28 Mei 2025", 30, 25],
  ["Lotek Shabrina", "Kamis, 05 Juni 2025", 20, 16],
  ["Angkringan Pak Mucry", "Jumat, 13 Juni 2025", 22, 13],
  ["Pendowo 5 Bantul", "Sabtu, 14 Juni 2025", 22, 11],
  ["Angkringan Pak Gugum", "Sabtu, 14 Juni 2025", 30, 19],
  ["Lotek Shabrina", "Senin, 16 Juni 2025", 25, 20],
  ["Salon Mbak Nana", "Sabtu, 21 Juni 2025", 30, 23],
  ["Pendowo 5 Bantul", "Sabtu, 28 Juni 2025", 20, 6],
  ["Angkringan Pak Gugum", "Sabtu, 28 Juni 2025", 30, 21],
  ["Lotek Shabrina", "Senin, 30 Juni 2025", 22, 17],
  ["Angkringan Pak Mucry", "Selasa, 01 Juli 2025", 22, 20],
  ["Angkringan Pak Mucry", "Jumat, 11 Juli 2025", 22, 20],
  ["Salon Mbak Nana", "Sabtu, 12 Juli 2025", 30, 28],
  ["Angkringan Pak Gugum", "Selasa, 12 Juli 2022", 30, 28],
  ["Lotek Shabrina", "Senin, 14 Juli 2025", 22, 14],
  ["Angkringan Pak Mucry", "Selasa, 15 Juli 2025", 25, 20],
  ["Angkringan Pak Mucry", "Jumat, 18 Juli 2025", 25, 23],
  ["Pendowo 5 Bantul", "Sabtu, 26 Juli 2025", 20, 12],
  ["Salon Mbak Nana", "Sabtu, 26 Juli 2025", 30, 28],
  ["Angkringan Pak Gugum", "Sabtu, 26 Juli 2025", 30, 28],
  ["Lotek Shabrina", "Senin, 28 Juli 2025", 22, 19],
  ["Angkringan Pak Mucry", "Senin, 28 Juli 2025", 22, 20],
  ["Angkringan Pak Mucry", "Senin, 11 Agustus 2025", 22, 20],
  ["Lotek Shabrina", "Selasa, 12 Agustus 2025", 22, 19],
  ["Angkringan Pak Mucry", "Jumat, 15 Agustus 2025", 22, 20],
  ["Pendowo 5 Bantul", "Sabtu, 16 Agustus 2025", 12, 6],
  ["Salon Mbak Nana", "Sabtu, 16 Agustus 2025", 30, 22],
  ["Angkringan Pak Gugum", "Sabtu, 16 Agustus 2025", 30, 28],
  ["Angkringan Pak Mucry", "Kamis, 21 Agustus 2025", 22, 19],
  ["Lotek Shabrina", "Rabu, 27 Agustus 2025", 22, 20],
  ["Angkringan Pak Mucry", "Kamis, 28 Agustus 2025", 22, 20],
  ["Angkringan Pak Gugum", "Sabtu, 30 Agustus 2025", 30, 28],
  ["Salon Mbak Nana", "Sabtu, 30 Agustus 2025", 30, 26],
  ["Angkringan Pak Mucry", "Rabu, 03 September 2025", 22, 18],
  ["Angkringan Pak Mucry", "Selasa, 09 September 2025", 22, 16],
  ["Lotek Shabrina", "Kamis, 11 September 2025", 22, 19],
  ["Angkringan Pak Gugum", "Jumat, 12 September 2025", 30, 28],
  ["Pendowo 5 Bantul", "Jumat, 12 September 2025", 12, 4],
  ["Angkringan Pak Mucry", "Jumat, 19 September 2025", 22, 16],
  ["Angkringan Pak Mucry", "Minggu, 21 September 2025", 22, 20],
  ["Lotek Shabrina", "Jumat, 26 September 2025", 22, 19],
  ["Salon Mbak Nana", "Sabtu, 27 September 2025", 30, 28],
  ["Angkringan Pak Gugum", "Sabtu, 27 September 2025", 30, 26],
  ["Angkringan Pak Mucry", "Minggu, 28 September 2025", 22, 20],
  ["Lotek Shabrina", "Jumat, 10 Oktober 2025", 22, 13],
  ["Pendowo 5 Bantul", "Sabtu, 11 Oktober 2025", 12, 4],
  ["Salon Mbak Nana", "Sabtu, 11 Oktober 2025", 30, 28],
  ["Angkringan Pak Gugum", "Sabtu, 11 Oktober 2025", 30, 24],
  ["Angkringan Pak Mucry", "Senin, 13 Oktober 2025", 22, 16],
  ["Angkringan Pak Mucry", "Senin, 20 Oktober 2025", 22, 20],
  ["Lotek Shabrina", "Selasa, 21 Oktober 2025", 22, 16],
  ["Salon Mbak Nana", "Sabtu, 25 Oktober 2025", 30, 24],
  ["Angkringan Pak Gugum", "Sabtu, 25 Oktober 2025", 30, 20],
  ["Angkringan Pak Mucry", "Rabu, 29 Oktober 2025", 22, 20],
  ["Lotek Shabrina", "Sabtu, 01 November 2025", 22, 15],
  ["Angkringan Pak Mucry", "Selasa, 04 November 2025", 22, 17],
  ["Angkringan Pak Gugum", "Jumat, 07 November 2025", 30, 24],
  ["Pendowo 5 Bantul", "Jumat, 07 November 2025", 12, 10],
  ["Salon Mbak Nana", "Jumat, 07 November 2025", 30, 27],
  ["Angkringan Pak Mucry", "Senin, 17 November 2025", 22, 20],
  ["Lotek Shabrina", "Senin, 17 November 2025", 22, 16],
  ["Angkringan Pak Gugum", "Sabtu, 22 November 2025", 30, 28],
  ["Salon Mbak Nana", "Sabtu, 22 November 2025", 30, 28],
  ["Angkringan Pak Mucry", "Senin, 24 November 2025", 22, 20],
  ["Lotek Shabrina", "Rabu, 26 November 2025", 22, 20],
  ["Angkringan Pak Mucry", "Minggu, 30 November 2025", 22, 20],
  ["Salon Mbak Nana", "Sabtu, 06 Desember 2025", 30, 28],
  ["Angkringan Pak Gugum", "Sabtu, 06 Desember 2025", 30, 28],
  ["Angkringan Pak Mucry", "Selasa, 16 Desember 2025", 22, 13],
  ["Lotek Shabrina", "Selasa, 16 Desember 2025", 22, 20],
  ["Salon Mbak Nana", "Sabtu, 20 Desember 2025", 30, 28],
  ["Angkringan Pak Gugum", "Sabtu, 20 Desember 2025", 30, 24],
  ["Angkringan Pak Mucry", "Senin, 22 Desember 2025", 22, 17],
  ["Lotek Shabrina", "Selasa, 30 Desember 2025", 22, 20],
  ["Angkringan Pak Mucry", "Selasa, 30 Desember 2025", 22, 20],
  ["Pendowo 5 Bantul", "Jumat, 02 Januari 2026", 12, 10],
  ["Salon Mbak Nana", "Jumat, 02 Januari 2026", 30, 28],
  ["Angkringan Pak Gugum", "Jumat, 02 Januari 2026", 30, 25],
  ["Lotek Shabrina", "Selasa, 13 Januari 2026", 22, 20],
  ["Angkringan Pak Mucry", "Selasa, 13 Januari 2026", 22, 20],
  ["Salon Mbak Nana", "Jumat, 16 Januari 2026", 30, 23],
  ["Angkringan Pak Gugum", "Jumat, 16 Januari 2026", 30, 28],
  ["Angkringan Pak Mucry", "Sabtu, 24 Januari 2026", 22, 20],
  ["Lotek Shabrina", "Senin, 26 Januari 2026", 22, 19],
  ["Pendowo 5 Bantul", "Sabtu, 31 Januari 2026", 12, 2],
  ["Salon Mbak Nana", "Sabtu, 31 Januari 2026", 30, 28],
  ["Angkringan Pak Gugum", "Sabtu, 31 Januari 2026", 30, 28],
  ["Angkringan Pak Mucry", "Senin, 02 Februari 2026", 22, 20],
  ["Lotek Shabrina", "Rabu, 04 Februari 2026", 22, 17],
  ["Angkringan Pak Mucry", "Senin, 16 Februari 2026", 22, 20],
  ["Angkringan Pak Gugum", "Selasa, 17 Februari 2026", 30, 20],
  ["Lotek Shabrina", "Rabu, 18 Februari 2026", 22, 20],
  ["Angkringan Pak Mucry", "Sabtu, 28 Februari 2026", 22, 20],
  ["Angkringan Pak Gugum", "Sabtu, 07 Maret 2026", 30, 24],
  ["Angkringan Pak Mucry", "Sabtu, 28 Maret 2026", 22, 20],
  ["Lotek Shabrina", "Rabu, 01 April 2026", 22, 18],
  ["Angkringan Pak Gugum", "Sabtu, 04 April 2026", 30, 25],
  ["Angkringan Pak Mucry", "Kamis, 09 April 2026", 22, 18],
  ["Angkringan Pak Gugum", "Sabtu, 18 April 2026", 30, 26],
  ["Salon Mbak Nana", "Sabtu, 18 April 2026", 30, 19],
  ["Lotek Shabrina", "Sabtu, 18 April 2026", 22, 12],
  ["Angkringan Pak Mucry", "Sabtu, 18 April 2026", 22, 20],
  ["Pendowo 5 Bantul", "Sabtu, 04 April 2026", 12, 10],
  ["Angkringan Pak Mucry", "Kamis, 23 April 2026", 22, 20],
  ["Pendowo 5 Bantul", "Sabtu, 02 Mei 2026", 12, 0],
  ["Angkringan Pak Gugum", "Sabtu, 02 Mei 2026", 30, 22],
  ["Salon Mbak Nana", "Sabtu, 02 Mei 2026", 30, 20],
  ["Angkringan Pak Mucry", "Selasa, 05 Mei 2026", 22, 20],
  ["Lotek Shabrina", "Jumat, 15 Mei 2026", 22, 0],
  ["Angkringan Pak Mucry", "Jumat, 15 Mei 2026", 22, 0],
  ["Angkringan Pak Gugum", "Sabtu, 16 Mei 2026", 30, 0],
  ["Salon Mbak Nana", "Sabtu, 16 Mei 2026", 30, 0],
]

/** Map alias store names to canonical seed names */
const storeNameMap: Record<string, string> = {
  "Angkringan Pak Mucry": "Angkringan Pak Mukri",
}

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

  // Lookup store by name (with alias support)
  const storeByName = new Map<string, string>()
  for (const s of stores) {
    storeByName.set(s.name, s.name)
    const alias = Object.entries(storeNameMap).find(
      ([_, v]) => v === s.name,
    )?.[0]
    if (alias) storeByName.set(alias, s.name)
  }

  let seeded = 0
  let skipped = 0

  for (const [rawStoreName, rawDate, rawAmount] of salesIncomeData) {
    const canonical = storeByName.get(rawStoreName)
    if (!canonical) {
      console.warn(`Unknown store: "${rawStoreName}", skipping`)
      skipped++
      continue
    }

    const store = await prisma.store.findFirst({
      where: { name: canonical },
    })
    if (!store) {
      console.warn(`Store not found in DB: "${canonical}", skipping`)
      skipped++
      continue
    }

    const salesDate = parseDate(rawDate)
    const amount = parseAmount(rawAmount)

    // Avoid duplicate entries (same store + date + amount)
    const dup = await prisma.salesIncome.findFirst({
      where: { storeId: store.id, salesDate, amount },
    })
    if (dup) {
      skipped++
      continue
    }

    await prisma.salesIncome.create({
      data: { storeId: store.id, salesDate, amount },
    })
    seeded++
  }

  console.log(`Sales income: ${seeded} seeded, ${skipped} skipped`)

  // --- Sales Tracker ---
  seeded = 0
  skipped = 0

  for (const [rawStoreName, rawDate, saleCount, soldCount] of salesTrackerData) {
    const canonical = storeByName.get(rawStoreName)
    if (!canonical) {
      console.warn(`Unknown store: "${rawStoreName}", skipping`)
      skipped++
      continue
    }

    const store = await prisma.store.findFirst({ where: { name: canonical } })
    if (!store) {
      console.warn(`Store not found in DB: "${canonical}", skipping`)
      skipped++
      continue
    }

    const salesDate = parseDate(rawDate)

    const dup = await prisma.salesTracker.findFirst({
      where: { storeId: store.id, salesDate, saleCount, soldCount },
    })
    if (dup) {
      skipped++
      continue
    }

    await prisma.salesTracker.create({
      data: { storeId: store.id, salesDate, saleCount, soldCount },
    })
    seeded++
  }

  console.log(`Sales tracker: ${seeded} seeded, ${skipped} skipped`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
