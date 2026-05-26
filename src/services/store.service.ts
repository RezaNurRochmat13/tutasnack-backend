import { Store } from "@prisma/client"
import { IStoreRepository, CreateStoreInput } from "../repositories"

export interface IStoreService {
  list(): Promise<Store[]>
  get(id: string): Promise<Store>
  create(input: CreateStoreInput): Promise<Store>
  update(id: string, input: Partial<CreateStoreInput>): Promise<Store>
  remove(id: string): Promise<Store>
}

export class StoreService implements IStoreService {
  constructor(private storeRepository: IStoreRepository) {}

  async list(): Promise<Store[]> {
    return this.storeRepository.findAll()
  }

  async get(id: string): Promise<Store> {
    const store = await this.storeRepository.findById(id)
    if (!store) throw new Error("Store not found")
    return store
  }

  async create(input: CreateStoreInput): Promise<Store> {
    return this.storeRepository.create(input)
  }

  async update(id: string, input: Partial<CreateStoreInput>): Promise<Store> {
    await this.get(id)
    return this.storeRepository.update(id, input)
  }

  async remove(id: string): Promise<Store> {
    await this.get(id)
    return this.storeRepository.delete(id)
  }
}
