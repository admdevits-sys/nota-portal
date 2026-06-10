import { validateByChaveController, getValidacoesController, getValidacaoByChaveController, } from "../controllers/validation.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
export async function validationRoutes(app) {
    // Validar nota fiscal pela chave de acesso (sem upload de XML)
    app.post("/validation/validar", {
        preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])],
    }, validateByChaveController);
    // Listar histórico de validações
    app.get("/validation", { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])] }, getValidacoesController);
    // Consultar validação por chave de acesso
    app.get("/validation/chave/:chaveAcesso", { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])] }, getValidacaoByChaveController);
}
