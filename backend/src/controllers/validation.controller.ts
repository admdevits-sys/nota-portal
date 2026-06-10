import { type FastifyReply, type FastifyRequest } from "fastify";
import { validateXmlByChaveService, getValidationHistory } from "../services/xml-validation.service.js";
import { prisma } from "../db/prisma.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFastifyRequest = FastifyRequest<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFastifyReply = FastifyReply<any>;

/**
 * Valida nota fiscal pela chave de acesso (sem upload de XML)
 */
export async function validateByChaveController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const { chaveAcesso, tipoDocumento } = (req.body as any) as { chaveAcesso: string; tipoDocumento?: "NFE" | "NFSE" };
  const user = (req as any).user as { usuarioId: string };

  if (!chaveAcesso) {
    reply.code(400).send({ error: "BAD_REQUEST", message: "Chave de acesso é obrigatória." });
    return;
  }

  try {
    const result = await validateXmlByChaveService({
      usuarioId: user.usuarioId,
      chaveAcesso,
      tipoDocumento: tipoDocumento || "NFE",
    });

    reply.code(200).send(result);
  } catch (err: any) {
    reply.code(500).send({
      error: "VALIDATION_FAILED",
      message: err?.message ?? "Falha ao validar nota fiscal.",
    });
  }
}

/**
 * Lista histórico de validações
 */
export async function getValidacoesController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const query = (req as any).query as { page?: string; limit?: string };
  const page = parseInt(query.page ?? "1", 10);
  const limit = parseInt(query.limit ?? "20", 10);
  const user = (req as any).user as { usuarioId: string };

  try {
    const result = await getValidationHistory(user.usuarioId, page, limit);
    reply.code(200).send(result);
  } catch (err: any) {
    reply.code(500).send({
      error: "QUERY_FAILED",
      message: err?.message ?? "Falha ao consultar validações.",
    });
  }
}

/**
 * Busca validação por chave de acesso
 */
export async function getValidacaoByChaveController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const { chaveAcesso } = (req.params as any) as { chaveAcesso: string };

  try {
    const validacao = await prisma.validacoes_xml.findFirst({
      where: { chave_acesso: chaveAcesso },
      orderBy: { data_criacao: "desc" },
    });

    if (!validacao) {
      reply.code(404).send({
        error: "NOT_FOUND",
        message: "Validação não encontrada para esta chave de acesso.",
      });
      return;
    }

    reply.code(200).send(validacao);
  } catch (err: any) {
    reply.code(500).send({
      error: "QUERY_FAILED",
      message: err?.message ?? "Falha ao consultar validação.",
    });
  }
}