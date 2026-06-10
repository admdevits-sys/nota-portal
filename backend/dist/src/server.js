import "dotenv/config";
import Fastify from "fastify";
console.log("[env] DATABASE_URL", process.env.DATABASE_URL ? "present" : "missing");
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import { healthRoutes, authRoutes, cadastrosRoutes, importRoutes, dashboardRoutes, validationRoutes } from "./routes/index";
const app = Fastify({
    logger: true,
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
    // Diagnóstico: listar rotas registradas
    app.printRoutes();
}
await build();
app.listen({
    port: Number(process.env.PORT ?? 3001),
    host: "0.0.0.0",
});
