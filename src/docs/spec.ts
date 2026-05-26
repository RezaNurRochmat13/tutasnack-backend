export const spec = {
  openapi: "3.0.3",
  info: {
    title: "TutaSnack API",
    version: "1.0.0",
    description: "API untuk pencatatan penjualan, pengeluaran, dan tracker snack TutaSnack",
  },
  servers: [{ url: "/", description: "Current" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan token JWT dari endpoint /auth/login",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Autentikasi" },
    { name: "Users", description: "Manajemen user" },
    { name: "Stores", description: "Data toko" },
    { name: "Sales Income", description: "Pencatatan pendapatan" },
    { name: "Expenses", description: "Pencatatan pengeluaran" },
    { name: "Sales Tracker", description: "Tracker jumlah penjualan snack" },
  ],
  paths: {
    // ── Auth ────────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Registrasi user baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", minLength: 6, example: "password123" },
                  name: { type: "string", example: "John" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User berhasil didaftarkan" },
          409: { description: "Email sudah terdaftar" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login berhasil, mengembalikan token JWT" },
          401: { description: "Email atau password salah" },
        },
      },
    },

    // ── Users ───────────────────────────────────────────────────────────────
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Daftar semua user",
        responses: { 200: { description: "OK" } },
      },
      post: {
        tags: ["Users"],
        summary: "Buat user baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "User berhasil dibuat" } },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Detail user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "User tidak ditemukan" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "User tidak ditemukan" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Hapus user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "User tidak ditemukan" },
        },
      },
    },

    // ── Stores ──────────────────────────────────────────────────────────────
    "/stores": {
      get: {
        tags: ["Stores"],
        summary: "Daftar semua toko",
        responses: { 200: { description: "OK" } },
      },
      post: {
        tags: ["Stores"],
        summary: "Tambah toko baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Angkringan Pak Mukri" },
                  description: { type: "string", example: "Angkringan" },
                  address: { type: "string", example: "Jl. Sinduadi" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Toko berhasil dibuat" } },
      },
    },
    "/stores/{id}": {
      get: {
        tags: ["Stores"],
        summary: "Detail toko",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Toko tidak ditemukan" },
        },
      },
      put: {
        tags: ["Stores"],
        summary: "Update toko",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Toko tidak ditemukan" },
        },
      },
      delete: {
        tags: ["Stores"],
        summary: "Hapus toko",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Toko tidak ditemukan" },
        },
      },
    },

    // ── Sales Income ────────────────────────────────────────────────────────
    "/sales-income": {
      get: {
        tags: ["Sales Income"],
        summary: "Daftar pendapatan",
        parameters: [
          { name: "storeId", in: "query", required: false, schema: { type: "string" }, description: "Filter by toko" },
        ],
        responses: { 200: { description: "OK" } },
      },
      post: {
        tags: ["Sales Income"],
        summary: "Catat pendapatan baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["storeId", "salesDate", "amount"],
                properties: {
                  storeId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
                  salesDate: { type: "string", format: "date", example: "2025-02-20" },
                  amount: { type: "number", example: 50000 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Pendapatan tercatat" },
          404: { description: "Toko tidak ditemukan" },
        },
      },
    },
    "/sales-income/{id}": {
      get: {
        tags: ["Sales Income"],
        summary: "Detail pendapatan",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
      put: {
        tags: ["Sales Income"],
        summary: "Update pendapatan",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
      delete: {
        tags: ["Sales Income"],
        summary: "Hapus pendapatan",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
    },

    // ── Expenses ────────────────────────────────────────────────────────────
    "/expenses": {
      get: {
        tags: ["Expenses"],
        summary: "Daftar pengeluaran",
        responses: { 200: { description: "OK" } },
      },
      post: {
        tags: ["Expenses"],
        summary: "Catat pengeluaran baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "expenseDate", "amount"],
                properties: {
                  name: { type: "string", example: "Beli bahan baku" },
                  expenseDate: { type: "string", format: "date", example: "2025-02-20" },
                  amount: { type: "number", example: 25000 },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Pengeluaran tercatat" } },
      },
    },
    "/expenses/{id}": {
      get: {
        tags: ["Expenses"],
        summary: "Detail pengeluaran",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
      put: {
        tags: ["Expenses"],
        summary: "Update pengeluaran",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
      delete: {
        tags: ["Expenses"],
        summary: "Hapus pengeluaran",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
    },

    // ── Sales Tracker ───────────────────────────────────────────────────────
    "/sales-tracker": {
      get: {
        tags: ["Sales Tracker"],
        summary: "Daftar tracker penjualan",
        parameters: [
          { name: "storeId", in: "query", required: false, schema: { type: "string" }, description: "Filter by toko" },
        ],
        responses: { 200: { description: "OK" } },
      },
      post: {
        tags: ["Sales Tracker"],
        summary: "Catat tracker baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["storeId", "salesDate", "saleCount", "soldCount"],
                properties: {
                  storeId: { type: "string", format: "uuid" },
                  salesDate: { type: "string", format: "date", example: "2025-02-20" },
                  saleCount: { type: "integer", example: 30 },
                  soldCount: { type: "integer", example: 25 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tracker tercatat" },
          404: { description: "Toko tidak ditemukan" },
        },
      },
    },
    "/sales-tracker/{id}": {
      get: {
        tags: ["Sales Tracker"],
        summary: "Detail tracker",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
      put: {
        tags: ["Sales Tracker"],
        summary: "Update tracker",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
      delete: {
        tags: ["Sales Tracker"],
        summary: "Hapus tracker",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Data tidak ditemukan" },
        },
      },
    },
  },
} as const
