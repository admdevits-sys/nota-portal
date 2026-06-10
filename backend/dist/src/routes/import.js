import { uploadXmlController, deleteNotaController } from "../controllers/import.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
export async function importRoutes(app) {
    // Upload XML (NFE/NFSE)
    app.post("/import/xml", { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR", "AUDITOR"])] }, uploadXmlController);
    // Delete nota fiscal
    app.delete("/import/notas/:notaId", { preHandler: [authenticate, authorize(["ADMIN", "OPERADOR"])] }, deleteNotaController);
}
