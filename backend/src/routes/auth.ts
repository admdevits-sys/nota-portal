import { type FastifyInstance } from "fastify";
import { registerController, loginController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { getPerfis } from "../services/auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", registerController);
  app.post("/auth/login", loginController);

  app.get("/auth/me", { preHandler: [authenticate] }, async (req) => {
    const user = (req as any).user;
    return { ok: true, user };
  });

  app.get("/auth/perfis", async () => {
    const perfis = await getPerfis();
    return { data: perfis };
  });
}
