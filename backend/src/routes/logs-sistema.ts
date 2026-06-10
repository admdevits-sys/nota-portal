import { FastifyInstance } from "fastify";
import { listLogsSistemaController } from "../controllers/logs-sistema.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function logsSistemaRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/logs-sistema",
    { preHandler: [authenticate] },
    listLogsSistemaController
  );
}
