import { type FastifyInstance } from "fastify";
import { uploadXmlController, deleteNotaController, getNotaDetalhadaController } from "../controllers/import.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: any, reply: any) => Promise<void>;

export async function importRoutes(app: FastifyInstance) {
  // Upload XML (NFE/NFSE)
  app.post(
    "/import/xml",
    { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])] },
    uploadXmlController as RouteHandler
  );

  // Get nota detalhada (com itens, servicos, impostos)
  app.get(
    "/import/notas/:notaId",
    { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])] },
    getNotaDetalhadaController as RouteHandler
  );

  // Delete nota fiscal
  app.delete(
    "/import/notas/:notaId",
    { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR"])] },
    deleteNotaController as RouteHandler
  );
}