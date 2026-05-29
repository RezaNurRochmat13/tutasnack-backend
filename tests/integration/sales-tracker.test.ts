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

describe("Sales Tracker API", () => {
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

  describe("POST /sales-tracker", () => {
    it("should create a tracker record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker`, {
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
      expect(body.data.saleCount).toBe(100)
      expect(body.data.soldCount).toBe(75)
      expect(body.data.storeId).toBe(storeId)
    })

    it("should return 404 for non-existent store", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker`, {
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
        new Request(`${BASE_URL}/api/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", saleCount: 50, soldCount: 30 }),
        }),
        bindings,
      )

      const res = await app.fetch(new Request(`${BASE_URL}/api/sales-tracker`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.length).toBe(1)
    })

    it("should filter by storeId", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker?storeId=${storeId}`),
        bindings,
      )
      expect(res.status).toBe(200)
    })

    it("should return 400 for invalid storeId format", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker?storeId=invalid-uuid`),
        bindings,
      )
      expect(res.status).toBe(400)
    })

    it("should accept store_id query param (underscore)", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker?store_id=${storeId}`),
        bindings,
      )
      expect(res.status).toBe(200)
    })

    it("should return pagination metadata", async () => {
      const res = await app.fetch(new Request(`${BASE_URL}/api/sales-tracker`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.pagination).toBeDefined()
      expect(body.pagination.page).toBe(1)
      expect(body.pagination.limit).toBe(10)
    })

    it("should paginate with page and limit", async () => {
      for (let i = 0; i < 3; i++) {
        await app.fetch(
          new Request(`${BASE_URL}/api/sales-tracker`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeId, salesDate: `2024-06-1${i}`, saleCount: 10, soldCount: 5 }),
          }),
          bindings,
        )
      }

      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker?page=1&limit=2`),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.length).toBe(2)
      expect(body.pagination.total).toBe(3)
      expect(body.pagination.totalPages).toBe(2)
    })
  })

  describe("GET /sales-tracker/:id", () => {
    it("should return record by id", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", saleCount: 20, soldCount: 15 }),
        }),
        bindings,
      )
      const { data: { id } } = await create.json() as any

      const res = await app.fetch(new Request(`${BASE_URL}/api/sales-tracker/${id}`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.saleCount).toBe(20)
    })

    it("should return 404 for missing record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker/00000000-0000-0000-0000-000000000000`),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("PUT /sales-tracker/:id", () => {
    it("should update a record", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", saleCount: 50, soldCount: 30 }),
        }),
        bindings,
      )
      const { data: { id } } = await create.json() as any

      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saleCount: 100 }),
        }),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.data.saleCount).toBe(100)
    })

    it("should return 404 for non-existent record", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker/00000000-0000-0000-0000-000000000000`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saleCount: 100 }),
        }),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("DELETE /sales-tracker/:id", () => {
    it("should delete a record", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, salesDate: "2024-06-15", saleCount: 10, soldCount: 8 }),
        }),
        bindings,
      )
      const { data: { id } } = await create.json() as any

      const del = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker/${id}`, { method: "DELETE" }),
        bindings,
      )
      expect(del.status).toBe(200)

      const get = await app.fetch(
        new Request(`${BASE_URL}/api/sales-tracker/${id}`),
        bindings,
      )
      expect(get.status).toBe(404)
    })
  })
})
