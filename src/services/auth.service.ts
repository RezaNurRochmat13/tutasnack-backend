import { IUserRepository } from "../repositories"
import { hashPassword, verifyPassword } from "../lib/password"
import { signToken } from "../lib/jwt"

export type RegisterInput = {
  email: string
  password: string
  name?: string
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthResult = {
  token: string
  user: {
    id: string
    email: string
    name: string | null
  }
}

export interface IAuthService {
  register(input: RegisterInput): Promise<AuthResult>
  login(input: LoginInput): Promise<AuthResult>
}

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) {
      throw new Error("Email already registered")
    }

    const hashed = await hashPassword(input.password)
    const user = await this.userRepository.create({
      email: input.email,
      password: hashed,
      name: input.name,
    })

    const token = await signToken(user, this.jwtSecret)
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    const valid = await verifyPassword(input.password, user.password)
    if (!valid) {
      throw new Error("Invalid email or password")
    }

    const token = await signToken(user, this.jwtSecret)
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    }
  }
}
