import { PrismaClient, User } from "@prisma/client"

export type CreateUserInput = {
  email: string
  password: string
  name?: string
}

export interface IUserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(input: CreateUserInput): Promise<User>
  update(id: string, input: Partial<CreateUserInput>): Promise<User>
  delete(id: string): Promise<User>
}

export type SafeUser = Omit<User, "password">

export function toSafeUser(user: User): SafeUser {
  const { password: _, ...safe } = user
  return safe
}

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: "desc" } })
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: input })
  }

  async update(id: string, input: Partial<CreateUserInput>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } })
  }
}
