import { type FastifyReply, type FastifyRequest } from "fastify";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import { createAuditLog } from "../services/audit.service.js";

function getRequestMetadata(req: FastifyRequest) {
  return {
    endereco_ip:
      String(req.ip) ||
      String(req.headers["x-forwarded-for"] ?? "unknown") ||
      "unknown",
    agente_usuario: String(req.headers["user-agent"] ?? "unknown"),
  };
}

export async function registerController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    reply.code(400).send({ error: "BAD_REQUEST", details: parsed.error.flatten() });
    return;
  }

  try {
    const user = await registerUser(parsed.data);

    const metadata = getRequestMetadata(req);
    await createAuditLog({
      fk_usuario_id: user.usuarioId,
      acao: "USUARIO_CADASTRADO",
      tabela_afetada: "usuarios",
      registro_afetado_id: user.usuarioId,
      endereco_ip: metadata.endereco_ip,
      agente_usuario: metadata.agente_usuario,
      detalhes: {
        email: user.email,
        perfilNome: user.perfilNome,
      },
    });

    const token = await reply.jwtSign(
      {
        usuarioId: user.usuarioId,
        perfilId: user.perfilId,
        perfilNome: user.perfilNome,
        email: user.email,
      },
      { sign: { expiresIn: "8h" } }
    );

    reply.code(201).send({
      token,
      usuarioId: user.usuarioId,
      nome: user.nome,
      email: user.email,
      perfilNome: user.perfilNome,
    });
  } catch (err: any) {
    console.error("REGISTER_ERROR", err);
    const code = err?.code;
    if (code === "EMAIL_ALREADY_EXISTS") {
      reply.code(409).send({ error: "EMAIL_ALREADY_EXISTS", message: "Email já cadastrado." });
      return;
    }
    if (code === "PERFIL_INVALIDO") {
      reply.code(400).send({ error: "PERFIL_INVALIDO", message: "Perfil inválido." });
      return;
    }
    reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
  }
}

export async function loginController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    reply.code(400).send({ error: "BAD_REQUEST", details: parsed.error.flatten() });
    return;
  }

  try {
    const data = await loginUser(parsed.data);

    const token = await reply.jwtSign(
      {
        usuarioId: data.usuarioId,
        perfilId: data.perfilId,
        perfilNome: data.perfilNome,
        email: data.email,
      },
      { sign: { expiresIn: "8h" } }
    );

    const metadata = getRequestMetadata(req);
    await createAuditLog({
      fk_usuario_id: data.usuarioId,
      acao: "LOGIN_SUCESSO",
      tabela_afetada: "usuarios",
      registro_afetado_id: data.usuarioId,
      endereco_ip: metadata.endereco_ip,
      agente_usuario: metadata.agente_usuario,
      detalhes: {
        email: data.email,
        perfilNome: data.perfilNome,
      },
    });

    reply.send({
      token,
      usuarioId: data.usuarioId,
      perfilNome: data.perfilNome,
      email: data.email,
    });
  } catch (err: any) {
    console.error("LOGIN_ERROR", err);
    const code = err?.code;
    if (code === "INVALID_CREDENTIALS") {
      reply.code(401).send({ error: "INVALID_CREDENTIALS", message: "Credenciais inválidas." });
      return;
    }
    reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
  }
}
