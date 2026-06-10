import { type FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import {
  createEmpresaController,
  createProdutoController,
  createServicoController,
  createUsuarioController,
  deleteEmpresaController,
  deleteProdutoController,
  deleteServicoController,
  deactivateUsuarioController,
  activateUsuarioController,
  getEmpresaController,
  getProdutoController,
  getServicoController,
  getUsuarioController,
  listEmpresasController,
  listProdutosController,
  listServicosController,
  listUsuariosController,
  updateEmpresaController,
  updateProdutoController,
  updateServicoController,
  updateUsuarioController,
} from "../controllers/cadastros.controller.js";

export async function cadastrosRoutes(app: FastifyInstance) {
  const adminOnly = [authenticate, authorize(["ADMIN"]) as any];
  const contributor = [authenticate, authorize(["ADMIN", "OPERADOR"]) as any];

  app.get("/cadastros/usuarios", { preHandler: adminOnly }, listUsuariosController);
  app.get("/cadastros/usuarios/:id", { preHandler: adminOnly }, getUsuarioController);
  app.post("/cadastros/usuarios", { preHandler: adminOnly }, createUsuarioController);
  app.put("/cadastros/usuarios/:id", { preHandler: adminOnly }, updateUsuarioController);
  app.delete("/cadastros/usuarios/:id", { preHandler: adminOnly }, deactivateUsuarioController);
  app.patch("/cadastros/usuarios/:id/activate", { preHandler: adminOnly }, activateUsuarioController);

  app.get("/cadastros/empresas", { preHandler: contributor }, listEmpresasController);
  app.get("/cadastros/empresas/:id", { preHandler: contributor }, getEmpresaController);
  app.post("/cadastros/empresas", { preHandler: contributor }, createEmpresaController);
  app.put("/cadastros/empresas/:id", { preHandler: contributor }, updateEmpresaController);
  app.delete("/cadastros/empresas/:id", { preHandler: contributor }, deleteEmpresaController);

  app.get("/cadastros/produtos", { preHandler: contributor }, listProdutosController);
  app.get("/cadastros/produtos/:id", { preHandler: contributor }, getProdutoController);
  app.post("/cadastros/produtos", { preHandler: contributor }, createProdutoController);
  app.put("/cadastros/produtos/:id", { preHandler: contributor }, updateProdutoController);
  app.delete("/cadastros/produtos/:id", { preHandler: contributor }, deleteProdutoController);

  app.get("/cadastros/servicos", { preHandler: contributor }, listServicosController);
  app.get("/cadastros/servicos/:id", { preHandler: contributor }, getServicoController);
  app.post("/cadastros/servicos", { preHandler: contributor }, createServicoController);
  app.put("/cadastros/servicos/:id", { preHandler: contributor }, updateServicoController);
  app.delete("/cadastros/servicos/:id", { preHandler: contributor }, deleteServicoController);
}
