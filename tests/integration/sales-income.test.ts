import { createTestApp } from "../helpers/app"
import { createDbHelper } from "../helpers/db"

const BASE_URL = "http://localhost"
const dbUrl = process.env.DATABASE_URL || ""
const bindings = {
  DATABASE_URL: dbUrl,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET || "",
}

async function createStore(app: ReturnType<typeof createTestApp>): Promise<string> {
  const res = await app.fetch(
    new Request(`${BASE_URL}/api/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Store" }),
    }),
    bindings,
  )
  const body = await res.json() as any
  return body.data.id
}

describe("Sales Income API", () => {
  let app: ReturnType<typeof createTestApp>
  let storeId: string

  beforeAll(async () => {
    app = createTestApp()
    await (await createDbHelper(dbUrl)).cleanAll()
  })

  beforeEach(async () => {
    await (await createDbHelper(dbUrl)).cleanAll()
    storeId = await createStore(app)
  })

  describe("POST /sales-income", () => {
    it("should create a sales income record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            salesDate: "2024-06-15",
            amount: 100000,
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(201)
      const body: any = await res.json()
      expect(body.data.amount).toBe(100000)
      expect(body.data.storeId).toBe(storeId)
    })

    it("should return 404 for non-existent store", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: "00000000-0000-0000-0000-000000000000",
            salesDate: "2024-06-15",
            amount: 50000,
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("GET /sales-income", () => {
    it("should list all records", async () => {
      await app.fetch(
        new Request(`${BASE_URL}/api/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", amount: 50000 }),
        }),
        bindings,
      )

      const res = await app.fetch(new Request(`${BASE_URL}/api/sales-income`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.length).toBe(1)
    })

    it("should filter by storeId", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income?storeId=${storeId}`),
        bindings,
      )
      expect(res.status).toBe(200)
    })

    it("should return pagination metadata", async () => {
      const res = await app.fetch(new Request(`${BASE_URL}/api/sales-income`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.pagination).toBeDefined()
      expect(body.pagination.page).toBe(1)
      expect(body.pagination.limit).toBe(10)
      expect(body.pagination.total).toBeGreaterThanOrEqual(0)
      expect(body.pagination.totalPages).toBeGreaterThanOrEqual(0)
    })

    it("should paginate with page and limit", async () => {
      // create 3 records
      for (let i = 0; i < 3; i++) {
        await app.fetch(
          new Request(`${BASE_URL}/api/sales-income`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeId, salesDate: `2024-06-1${i}`, amount: 10000 }),
          }),
          bindings,
        )
      }

      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income?page=1&limit=2`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.length).toBe(2)
      expect(body.pagination.page).toBe(1)
      expect(body.pagination.limit).toBe(2)
      expect(body.pagination.total).toBe(3)
      expect(body.pagination.totalPages).toBe(2)
    })
  })

  describe("GET /sales-income/:id", () => {
    it("should return record by id", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", amount: 75000 }),
        }),
        bindings,
      )
      const { data: { id } } = await create.json() as any

      const res = await app.fetch(new Request(`${BASE_URL}/api/sales-income/${id}`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.amount).toBe(75000)
    })

    it("should return 404 for missing record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income/00000000-0000-0000-0000-000000000000`),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("DELETE /sales-income/:id", () => {
    it("should delete a record", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", amount: 50000 }),
        }),
        bindings,
      )
      const { data: { id } } = await create.json() as any

      const del = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income/${id}`, { method: "DELETE" }),
        bindings,
      )
      expect(del.status).toBe(200)

      const get = await app.fetch(
        new Request(`${BASE_URL}/api/sales-income/${id}`),
        bindings,
      )
      expect(get.status).toBe(404)
    })
  })
})
