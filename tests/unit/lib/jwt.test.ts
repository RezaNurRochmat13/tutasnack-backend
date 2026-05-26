import { signToken, verifyToken } from "../../../src/lib/jwt"
import type { User } from "@prisma/client"

const mockUser: User = {
  id: "user-123",
  email: "test@test.com",
  password: "hashed-password",
  name: "Test User",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
}

const secret = "test-jwt-secret-at-least-this-length!"

describe("jwt", () => {
  describe("signToken", () => {
    it("should return a JWT string", async () => {
      const token = await signToken(mockUser, secret)
      expect(token).toEqual(expect.any(String))
      expect(token.split(".")).toHaveLength(3)
    })
  })

  describe("verifyToken", () => {
    it("should return the original payload", async () => {
      const token = await signToken(mockUser, secret)
      const payload = await verifyToken(token, secret)
      expect(payload.sub).toBe("user-123")
      expect(payload.email).toBe("test@test.com")
      expect(payload.exp).toEqual(expect.any(Number))
    })

    it("should reject an invalid token", async () => {
      await expect(
        verifyToken("invalid.token.here", secret),
      ).rejects.toThrow()
    })

    it("should reject a token signed with a different secret", async () => {
      const token = await signToken(mockUser, "different-secret-here-for-testing")
      await expect(verifyToken(token, secret)).rejects.toThrow()
    })
  })
})
