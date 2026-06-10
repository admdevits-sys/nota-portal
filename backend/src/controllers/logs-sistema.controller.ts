import { type FastifyReply, type FastifyRequest } from "fastify";
import { listLogsSistema } from "../services/logs-sistema.service.js";
import { serializeBigInt } from "../utils/bigint.js";

type AnyFastifyRequest = FastifyRequest<any>;
type AnyFastifyReply = FastifyReply<any>;

export async function listLogsSistemaController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const query = req.query as {
    fk_usuario_id?: string;
    modulo?: string;
    acao?: string;
    data_inicio?: string;
    data_fim?: string;
    page?: string;
    pageSize?: string;
  };

  try {
    const result = await listLogsSistema({
      fk_usuario_id: query.fk_usuario_id,
      modulo: query.modulo,
      acao: query.acao,
      data_inicio: query.data_inicio ? new Date(query.data_inicio) : undefined,
      data_fim: query.data_fim ? new Date(query.data_fim) : undefined,
      page: query.page ? parseInt(query.page, 10) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : 50,
    });

    reply.code(200).send(serializeBigInt(result));
  } catch (err: any) {
    reply.code(500).send({
      error: "FETCH_FAILED",
      message: err?.message ?? "Falha ao buscar logs do sistema.",
    });
  }
}
