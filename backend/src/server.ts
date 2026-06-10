import "dotenv/config";
import Fastify from "fastify";

console.log("[env] DATABASE_URL", process.env.DATABASE_URL ? "present" : "missing");
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import multipart from "@fastify/multipart";
import { prisma } from "./db/prisma.js";
import { healthRoutes, authRoutes, cadastrosRoutes, importRoutes, dashboardRoutes, validationRoutes, logsSistemaRoutes, permissoesRoutes } from "./routes/index";

// Serializador para BigInt (necessário para campos como PK_log_id do Prisma)
const bigIntSerializer = (key: string, value: any): any => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

const app = Fastify({
  logger: true,
});

// Serializar BigInt para string (necessário para campos do Prisma como PK_log_id)
app.addHook("onSend", async (_request, reply, payload) => {
  if (typeof payload === "string" || Buffer.isBuffer(payload)) {
    const str = typeof payload === "string" ? payload : payload.toString("utf-8");
    // BigInt values from Prisma are serialized as {"field": {"type":"BigInt","value":"123"}}
    // Convert them to plain strings
    const fixed = str.replace(/"type":"BigInt","value":"([^"]+)"/g, '"$1"');
    return fixed;
  }
  return payload;
});

async function build() {
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    sign: {
      expiresIn: "8h",
    },
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Nota Portal API",
        version: "0.1.0",
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "none",
      deepLinking: false,
    },
  });

  await app.register(multipart, {
    attachFieldsToBody: false,
  });

  app.get("/health", async () => {
    return { ok: true };
  });

  app.register(healthRoutes, { prefix: "/api" });
  app.register(authRoutes, { prefix: "/api" });
  app.register(cadastrosRoutes, { prefix: "/api" });
  app.register(dashboardRoutes, { prefix: "/api" });

  // Importação registrada sob /api
  await app.register(async (instance) => {
    await importRoutes(instance);
  }, { prefix: "/api" });

  // Validação XML (ADN / Sistema Nacional NFS-e)
  await app.register(async (instance) => {
    await validationRoutes(instance);
  }, { prefix: "/api" });

  // Logs do sistema
  await app.register(async (instance) => {
    await logsSistemaRoutes(instance);
  }, { prefix: "/api" });

  // Permissões (apenas admin)
  await app.register(async (instance) => {
    await permissoesRoutes(instance);
  }, { prefix: "/api" });

  // Diagnóstico: listar rotas registradas
  app.printRoutes();
}

await build();

app.listen({
  port: Number(process.env.PORT ?? 3001),
  host: "0.0.0.0",
});
