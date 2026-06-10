import { type FastifyRequest } from "fastify";

type JwtPayload = {
  usuarioId: string;
  perfilId: number;
  email: string;
};

export function getJwtPayloadFromReq(req: FastifyRequest): JwtPayload | null {
  const user = (req as any).user as JwtPayload | undefined;
  return user ?? null;
}
