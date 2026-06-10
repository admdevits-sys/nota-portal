import { FastifyInstance } from "fastify";
import {
  listPermissoesController,
  listPerfisController,
  getPermissoesPerfilController,
  updatePermissoesPerfilController,
} from "../controllers/permissoes.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function permissoesRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook("preHandler", authenticate);

  // GET /api/permissoes - Listar todas as permissões e módulos
  fastify.get("/permissoes", listPermissoesController);

  // GET /api/permissoes/perfis - Listar todos os perfis
  fastify.get("/permissoes/perfis", listPerfisController);

  // GET /api/permissoes/perfis/:perfilId - Obter permissões de um perfil
  fastify.get("/permissoes/perfis/:perfilId", getPermissoesPerfilController);

  // PUT /api/permissoes/perfis/:perfilId - Atualizar permissões de um perfil
  fastify.put("/permissoes/perfis/:perfilId", updatePermissoesPerfilController);
}
