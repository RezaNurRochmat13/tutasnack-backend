import { createTestApp } from "../helpers/app"
import { createDbHelper } from "../helpers/db"

const BASE_URL = "http://localhost"
const dbUrl = process.env.DATABASE_URL || ""
const bindings = {
  DATABASE_URL: dbUrl,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET || "",
}

describe("Dashboard API", () => {
  let app: ReturnType<typeof createTestApp>
  let db: Awaited<ReturnType<typeof createDbHelper>>

  beforeAll(async () => {
    app = createTestApp()
    db = await createDbHelper(dbUrl)
  })

  beforeEach(async () => {
    await db.cleanAll()

    // create store A
    const storeARes = await app.fetch(
      new Request(`${BASE_URL}/api/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Toko A", description: "Test store" }),
      }),
      bindings,
    )
    const { data: storeA } = await storeARes.json() as any

    // create store B
    const storeBRes = await app.fetch(
      new Request(`${BASE_URL}/api/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Toko B", description: "Second store" }),
      }),
      bindings,
    )
    const { data: storeB } = await storeBRes.json() as any

    // sales incomes (2025)
    await app.fetch(
      new Request(`${BASE_URL}/api/sales-income`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: storeA.id, salesDate: "2025-01-15", amount: 100000 }),
      }),
      bindings,
    )
    await app.fetch(
      new Request(`${BASE_URL}/api/sales-income`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: storeA.id, salesDate: "2025-01-20", amount: 50000 }),
      }),
      bindings,
    )
    await app.fetch(
      new Request(`${BASE_URL}/api/sales-income`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: storeA.id, salesDate: "2025-02-10", amount: 75000 }),
      }),
      bindings,
    )

    // expenses
    await app.fetch(
      new Request(`${BASE_URL}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Expense 1", expenseDate: "2025-01-05", amount: 25000 }),
      }),
      bindings,
    )
    await app.fetch(
      new Request(`${BASE_URL}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Expense 2", expenseDate: "2025-02-05", amount: 15000 }),
      }),
      bindings,
    )

    // sales trackers
    await app.fetch(
      new Request(`${BASE_URL}/api/sales-tracker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: storeA.id, salesDate: "2025-01-10", saleCount: 50, soldCount: 40 }),
      }),
      bindings,
    )
    await app.fetch(
      new Request(`${BASE_URL}/api/sales-tracker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: storeA.id, salesDate: "2025-01-15", saleCount: 30, soldCount: 25 }),
      }),
      bindings,
    )
    await app.fetch(
      new Request(`${BASE_URL}/api/sales-tracker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: storeB.id, salesDate: "2025-01-12", saleCount: 20, soldCount: 15 }),
      }),
      bindings,
    )
  })

  describe("GET /dashboard/total-expense", () => {
    it("should return total of all expenses", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/total-expense`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.total).toBe(40000)
    })
  })

  describe("GET /dashboard/total-revenue", () => {
    it("should return gross and net revenue", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/total-revenue`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.gross).toBe(225000)
      expect(body.data.net).toBe(185000)
    })
  })

  describe("GET /dashboard/monthly-recap", () => {
    it("should return income recap grouped by month", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/monthly-recap`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data).toHaveLength(2)

      const jan = body.data.find((d: any) => d.month === "01")
      expect(jan.total).toBe(150000)

      const feb = body.data.find((d: any) => d.month === "02")
      expect(feb.total).toBe(75000)
    })

    it("should filter by year", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/monthly-recap?year=2025`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.length).toBeGreaterThan(0)
      body.data.forEach((d: any) => {
        expect(d.year).toBe(2025)
      })
    })

    it("should return empty array when no data for year", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/monthly-recap?year=2020`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data).toHaveLength(0)
    })
  })

  describe("GET /dashboard/yearly-recap", () => {
    it("should return income recap grouped by year", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/yearly-recap`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.length).toBeGreaterThan(0)

      const year2025 = body.data.find((d: any) => d.year === 2025)
      expect(year2025.total).toBe(225000)
    })

    it("should filter by year", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/yearly-recap?year=2025`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0].year).toBe(2025)
      expect(body.data[0].total).toBe(225000)
    })

    it("should return empty array when no data for year", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/yearly-recap?year=2020`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data).toHaveLength(0)
    })
  })

  describe("GET /dashboard/sales-tracker", () => {
    it("should return sales tracker grouped by store", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/sales-tracker`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data).toHaveLength(2)

      const tokoA = body.data.find((d: any) => d.storeName === "Toko A")
      expect(tokoA.totalSaleCount).toBe(80)
      expect(tokoA.totalSoldCount).toBe(65)

      const tokoB = body.data.find((d: any) => d.storeName === "Toko B")
      expect(tokoB.totalSaleCount).toBe(20)
      expect(tokoB.totalSoldCount).toBe(15)
    })

    it("should filter by storeId", async () => {
      // fetch all first to get store id
      const allRes = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/sales-tracker`),
        bindings,
      )
      const allBody: any = await allRes.json()
      const tokoA = allBody.data.find((d: any) => d.storeName === "Toko A")

      const res = await app.fetch(
        new Request(`${BASE_URL}/api/dashboard/sales-tracker?storeId=${tokoA.storeId}`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0].storeName).toBe("Toko A")
      expect(body.data[0].totalSaleCount).toBe(80)
    })
  })
})
