import type { User } from "@prisma/client"
import { hashPassword } from "../../../src/lib/password"
import type { IUserRepository, CreateUserInput } from "../../../src/repositories"
import { AuthService } from "../../../src/services"

const mockUser: User = {
  id: "user-123",
  email: "test@test.com",
  password: "irrelevant",
  name: "Test",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
}

function createMockRepo(): IUserRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

const jwtSecret = "test-jwt-secret-for-testing"

describe("AuthService", () => {
  let repo: ReturnType<typeof createMockRepo>
  let authService: AuthService

  beforeEach(() => {
    repo = createMockRepo()
    authService = new AuthService(repo, jwtSecret)
  })

  describe("register", () => {
    it("should create user and return token", async () => {
      repo.findByEmail.mockResolvedValue(null)
      repo.create.mockImplementation(
        async (input: CreateUserInput) => ({
          ...mockUser,
          email: input.email,
          password: input.password,
          name: input.name ?? null,
        }),
      )

      const result = await authService.register({
        email: "new@test.com",
        password: "password123",
        name: "New User",
      })

      expect(result.token).toEqual(expect.any(String))
      expect(result.user.email).toBe("new@test.com")
      expect(result.user.name).toBe("New User")
      expect(repo.findByEmail).toHaveBeenCalledWith("new@test.com")
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@test.com",
          password: expect.any(String),
          name: "New User",
        }),
      )
    })

    it("should throw if email already exists", async () => {
      repo.findByEmail.mockResolvedValue(mockUser)

      await expect(
        authService.register({
          email: "test@test.com",
          password: "password123",
        }),
      ).rejects.toThrow("Email already registered")
    })
  })

  describe("login", () => {
    it("should return token for valid credentials", async () => {
      const realHash = await hashPassword("correct-password")
      repo.findByEmail.mockResolvedValue({ ...mockUser, password: realHash })

      const result = await authService.login({
        email: "test@test.com",
        password: "correct-password",
      })

      expect(result.token).toEqual(expect.any(String))
      expect(result.user.email).toBe("test@test.com")
    })

    it("should throw if email not found", async () => {
      repo.findByEmail.mockResolvedValue(null)

      await expect(
        authService.login({
          email: "nonexistent@test.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid email or password")
    })
  })
})
