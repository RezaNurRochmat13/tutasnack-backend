import { PrismaClient, Store } from "@prisma/client"

export type CreateStoreInput = {
  name: string
  description?: string
  address?: string
}

export interface IStoreRepository {
  findAll(): Promise<Store[]>
  findById(id: string): Promise<Store | null>
  create(input: CreateStoreInput): Promise<Store>
  update(id: string, input: Partial<CreateStoreInput>): Promise<Store>
  delete(id: string): Promise<Store>
}

export class StoreRepository implements IStoreRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Store[]> {
    return this.prisma.store.findMany({ orderBy: { createdAt: "desc" } })
  }

  async findById(id: string): Promise<Store | null> {
    return this.prisma.store.findUnique({ where: { id } })
  }

  async create(input: CreateStoreInput): Promise<Store> {
    return this.prisma.store.create({ data: input })
  }

  async update(id: string, input: Partial<CreateStoreInput>): Promise<Store> {
    return this.prisma.store.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<Store> {
    return this.prisma.store.delete({ where: { id } })
  }
}
