import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { faturamentoTotalController, fluxoCaixaController, impostosResumoController, notasController, statusCountController, topClientesController, topProdutosController, } from "../controllers/dashboard.controller.js";
export async function dashboardRoutes(app) {
    const preHandler = [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])];
    app.get("/dashboard/importacoes/status-count", { preHandler }, statusCountController);
    app.get("/dashboard/faturamento/total", { preHandler }, faturamentoTotalController);
    app.get("/dashboard/fluxo-caixa", { preHandler }, fluxoCaixaController);
    app.get("/dashboard/top-clientes", { preHandler }, topClientesController);
    app.get("/dashboard/top-produtos", { preHandler }, topProdutosController);
    app.get("/dashboard/impostos/resumo", { preHandler }, impostosResumoController);
    app.get("/dashboard/notas", { preHandler }, notasController);
}
