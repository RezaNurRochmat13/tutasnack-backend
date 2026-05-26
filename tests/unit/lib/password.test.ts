import { hashPassword, verifyPassword } from "../../../src/lib/password"

describe("password", () => {
  describe("hashPassword", () => {
    it("should return a string with salt:hash format", async () => {
      const result = await hashPassword("test-password")
      expect(result).toMatch(/^[a-f0-9]{32}:[a-f0-9]{64}$/)
    })

    it("should produce different hashes for the same password", async () => {
      const [a, b] = await Promise.all([
        hashPassword("same-password"),
        hashPassword("same-password"),
      ])
      expect(a).not.toBe(b)
    })
  })

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const hashed = await hashPassword("correct-password")
      const result = await verifyPassword("correct-password", hashed)
      expect(result).toBe(true)
    })

    it("should return false for incorrect password", async () => {
      const hashed = await hashPassword("real-password")
      const result = await verifyPassword("wrong-password", hashed)
      expect(result).toBe(false)
    })

    it("should return false for malformed stored hash", async () => {
      const result = await verifyPassword("any", "invalid-format")
      expect(result).toBe(false)
    })
  })
})
