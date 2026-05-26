import { z } from "zod"

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
})

export type Env = z.infer<typeof envSchema> & {
  NODE_ENV?: string
}
