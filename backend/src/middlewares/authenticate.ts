import { type FastifyReply, type FastifyRequest } from "fastify";
import type { JWT } from "@fastify/jwt";
import { prisma } from "../db/prisma.js";

export type AuthedUser = {
  usuarioId: string;
  perfilId: number;
  perfilNome: string;
  email: string;
};

export async function authenticate(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log("[auth] headers:", JSON.stringify(req.headers));
    const token = await req.jwtVerify<{
      usuarioId: string;
      perfilId: number;
      perfilNome: string;
      email: string;
    }>();
    // jwtVerify lança erro se inválido; aqui token é seguro
    (req as any).user = {
      usuarioId: token.usuarioId,
      perfilId: token.perfilId,
      perfilNome: token.perfilNome,
      email: token.email,
    } satisfies AuthedUser;
  } catch (err: any) {
    console.log("[auth] error:", err?.message);
    reply.code(401).send({ error: "UNAUTHORIZED", message: "Token inválido ou expirado." });
  }
}
