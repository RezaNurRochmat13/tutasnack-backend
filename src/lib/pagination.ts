export type PaginationParams = {
  page: number
  limit: number
}

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function paginate(page?: number, limit?: number): PaginationParams {
  return {
    page: Math.max(1, page ?? 1),
    limit: Math.min(100, Math.max(1, limit ?? 10)),
  }
}
