import { type FastifyReply, type FastifyRequest } from "fastify";
import type { AuthedUser } from "./authenticate";

export function authorize(requiredPerfis: Array<number | string>) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = (req as any).user as AuthedUser | undefined;

    if (!user) {
      reply.code(401).send({ error: "UNAUTHORIZED", message: "Não autenticado." });
      return;
    }

    const isAuthorized = requiredPerfis.some(
      (required) => required === user.perfilId || required === user.perfilNome
    );

    if (!isAuthorized) {
      reply.code(403).send({ error: "FORBIDDEN", message: "Sem permissão." });
      return;
    }
  };
}
