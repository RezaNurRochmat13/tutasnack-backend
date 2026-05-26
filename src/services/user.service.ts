import { User } from "@prisma/client"
import { IUserRepository, CreateUserInput } from "../repositories"

export interface IUserService {
  list(): Promise<User[]>
  get(id: string): Promise<User>
  getByEmail(email: string): Promise<User>
  create(input: CreateUserInput): Promise<User>
  update(id: string, input: Partial<CreateUserInput>): Promise<User>
  remove(id: string): Promise<User>
}

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async list(): Promise<User[]> {
    return this.userRepository.findAll()
  }

  async get(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) throw new Error("User not found")
    return user
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) throw new Error("User not found")
    return user
  }

  async create(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) throw new Error("Email already exists")
    return this.userRepository.create(input)
  }

  async update(id: string, input: Partial<CreateUserInput>): Promise<User> {
    await this.get(id)
    return this.userRepository.update(id, input)
  }

  async remove(id: string): Promise<User> {
    await this.get(id)
    return this.userRepository.delete(id)
  }
}
