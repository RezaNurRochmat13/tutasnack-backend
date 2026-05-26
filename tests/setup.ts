import { config } from "dotenv"
import { resolve } from "path"
import { existsSync, unlinkSync } from "fs"
import { execSync } from "child_process"

config({ path: resolve(__dirname, "../.env") })

const prjRoot = resolve(__dirname, "..")
const TEST_DB_PATH = resolve(prjRoot, "test.db")
const TEST_DB_URL = `file:${TEST_DB_PATH}`

process.env.DATABASE_URL = TEST_DB_URL

if (existsSync(TEST_DB_PATH)) {
  unlinkSync(TEST_DB_PATH)
}

execSync(`npx prisma db push --schema=prisma/schema.test.prisma --accept-data-loss --skip-generate`, {
  env: { ...process.env, TEST_DATABASE_URL: TEST_DB_URL },
  cwd: prjRoot,
  stdio: "pipe",
})
