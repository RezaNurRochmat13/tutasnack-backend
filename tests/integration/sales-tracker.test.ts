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
    new Request(`${BASE_URL}/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Store" }),
    }),
    bindings,
  )
  const { id } = await res.json()
  return id
}

describe("Sales Tracker API", () => {
  let app: ReturnType<typeof createTestApp>
  let storeId: string

  beforeAll(async () => {
    app = createTestApp()
    await createDbHelper(dbUrl).cleanAll()
  })

  beforeEach(async () => {
    await createDbHelper(dbUrl).cleanAll()
    storeId = await createStore(app)
  })

  describe("POST /sales-tracker", () => {
    it("should create a tracker record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            salesDate: "2024-06-15",
            saleCount: 100,
            soldCount: 75,
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(201)
      const body: any = await res.json()
      expect(body.saleCount).toBe(100)
      expect(body.soldCount).toBe(75)
      expect(body.storeId).toBe(storeId)
    })

    it("should return 404 for non-existent store", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: "00000000-0000-0000-0000-000000000000",
            salesDate: "2024-06-15",
            saleCount: 10,
            soldCount: 5,
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("GET /sales-tracker", () => {
    it("should list all records", async () => {
      await app.fetch(
        new Request(`${BASE_URL}/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", saleCount: 50, soldCount: 30 }),
        }),
        bindings,
      )

      const res = await app.fetch(new Request(`${BASE_URL}/sales-tracker`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.length).toBe(1)
    })

    it("should filter by storeId", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker?storeId=${storeId}`),
        bindings,
      )
      expect(res.status).toBe(200)
    })
  })

  describe("GET /sales-tracker/:id", () => {
    it("should return record by id", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", saleCount: 20, soldCount: 15 }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const res = await app.fetch(new Request(`${BASE_URL}/sales-tracker/${id}`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.saleCount).toBe(20)
    })

    it("should return 404 for missing record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker/00000000-0000-0000-0000-000000000000`),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("DELETE /sales-tracker/:id", () => {
    it("should delete a record", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", saleCount: 10, soldCount: 8 }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const del = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker/${id}`, { method: "DELETE" }),
        bindings,
      )
      expect(del.status).toBe(200)

      const get = await app.fetch(
        new Request(`${BASE_URL}/sales-tracker/${id}`),
        bindings,
      )
      expect(get.status).toBe(404)
    })
  })
})
