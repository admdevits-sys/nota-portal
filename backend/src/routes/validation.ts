import { type FastifyInstance } from "fastify";
import {
  validateByChaveController,
  getValidacoesController,
  getValidacaoByChaveController,
} from "../controllers/validation.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: any, reply: any) => Promise<void>;

export async function validationRoutes(app: FastifyInstance) {
  // Validar nota fiscal pela chave de acesso (sem upload de XML)
  app.post(
    "/validation/validar",
    {
      preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])],
    },
    validateByChaveController as RouteHandler
  );

  // Listar histórico de validações
  app.get(
    "/validation",
    { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])] },
    getValidacoesController as RouteHandler
  );

  // Consultar validação por chave de acesso
  app.get(
    "/validation/chave/:chaveAcesso",
    { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])] },
    getValidacaoByChaveController as RouteHandler
  );
}