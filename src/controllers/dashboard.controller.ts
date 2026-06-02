import type { Context } from "hono"
import type { Env } from "../config/env"
import { getPrisma } from "../db/prisma"
import { DashboardRepository } from "../repositories"
import { DashboardService } from "../services"

async function createService(c: Context<{ Bindings: Env }>) {
  const prisma = await getPrisma(c.env.DATABASE_URL, c.env.USE_NEON_ADAPTER === "true")
  return new DashboardService(new DashboardRepository(prisma))
}

export async function getTotalExpense(c: Context<{ Bindings: Env }>) {
  const total = await (await createService(c)).getTotalExpense()
  return c.json({
    status: "success",
    data: { total },
  })
}

export async function getTotalRevenue(c: Context<{ Bindings: Env }>) {
  const data = await (await createService(c)).getTotalRevenue()
  return c.json({
    status: "success",
    data,
  })
}

export async function getMonthlyRecap(c: Context<{ Bindings: Env }>) {
  const yearParam = c.req.query("year")
  const year = yearParam ? parseInt(yearParam) : undefined
  const data = await (await createService(c)).getMonthlyRecap(year)
  return c.json({
    status: "success",
    data,
  })
}

export async function getYearlyRecap(c: Context<{ Bindings: Env }>) {
  const yearParam = c.req.query("year")
  const year = yearParam ? parseInt(yearParam) : undefined
  const data = await (await createService(c)).getYearlyRecap(year)
  return c.json({
    status: "success",
    data,
  })
}

export async function getSalesTrackerByStore(c: Context<{ Bindings: Env }>) {
  const storeId = c.req.query("storeId") || undefined
  const data = await (await createService(c)).getSalesTrackerByStore(storeId)
  return c.json({
    status: "success",
    data,
  })
}
