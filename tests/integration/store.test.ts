import { createTestApp } from "../helpers/app"
import { createDbHelper } from "../helpers/db"

const BASE_URL = "http://localhost"
const dbUrl = process.env.DATABASE_URL || ""
const bindings = {
  DATABASE_URL: dbUrl,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET || "",
}

describe("Store API", () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(async () => {
    app = createTestApp()
    await createDbHelper(dbUrl).cleanAll()
  })

  afterEach(async () => {
    await createDbHelper(dbUrl).cleanAll()
  })

  describe("POST /stores", () => {
    it("should create a store", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Toko A",
            description: "Toko pertama",
            address: "Jl. Merdeka No.1",
          }),
        }),
        bindings,
      )
      expect(res.status).toBe(201)
      const body: any = await res.json()
      expect(body.name).toBe("Toko A")
      expect(body.id).toBeDefined()
    })

    it("should return 400 if name is missing", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "No name" }),
        }),
        bindings,
      )
      expect(res.status).toBe(400)
    })
  })

  describe("GET /stores", () => {
    it("should return all stores", async () => {
      await app.fetch(
        new Request(`${BASE_URL}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Toko A" }),
        }),
        bindings,
      )
      await app.fetch(
        new Request(`${BASE_URL}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Toko B" }),
        }),
        bindings,
      )

      const res = await app.fetch(new Request(`${BASE_URL}/stores`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.length).toBe(2)
    })
  })

  describe("GET /stores/:id", () => {
    it("should return store by id", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Toko C" }),
        }),
        bindings,
      )
      const { id } = await create.json()
      const res = await app.fetch(new Request(`${BASE_URL}/stores/${id}`), bindings)
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.name).toBe("Toko C")
    })

    it("should return 404 for missing store", async () => {
      const res = await app.fetch(
        new Request(`${BASE_URL}/stores/00000000-0000-0000-0000-000000000000`),
        bindings,
      )
      expect(res.status).toBe(404)
    })
  })

  describe("PUT /stores/:id", () => {
    it("should update a store", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Old Name" }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const res = await app.fetch(
        new Request(`${BASE_URL}/stores/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "New Name" }),
        }),
        bindings,
      )
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.name).toBe("New Name")
    })
  })

  describe("DELETE /stores/:id", () => {
    it("should delete a store", async () => {
      const create = await app.fetch(
        new Request(`${BASE_URL}/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "To Delete" }),
        }),
        bindings,
      )
      const { id } = await create.json()

      const res = await app.fetch(
        new Request(`${BASE_URL}/stores/${id}`, { method: "DELETE" }),
        bindings,
      )
      expect(res.status).toBe(200)

      const get = await app.fetch(
        new Request(`${BASE_URL}/stores/${id}`),
        bindings,
      )
      expect(get.status).toBe(404)
    })
  })
})
