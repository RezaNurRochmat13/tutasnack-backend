import { Hono } from "hono"
import type { Env } from "../config/env"
import * as DashboardController from "../controllers/dashboard.controller"

export const dashboardRoute = new Hono<{ Bindings: Env }>()

dashboardRoute.get("/total-expense", DashboardController.getTotalExpense)
dashboardRoute.get("/total-revenue", DashboardController.getTotalRevenue)
dashboardRoute.get("/monthly-recap", DashboardController.getMonthlyRecap)
