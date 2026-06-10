import { type FastifyReply, type FastifyRequest } from "fastify";
import {
  getAllPermissoes,
  getPermissoesByPerfil,
  updatePermissoesPerfil,
  getAllPerfis,
  getPerfilById,
  MODULOS,
  ACOES,
} from "../services/permissoes.service.js";
import { serializeBigInt } from "../utils/bigint.js";

type AnyFastifyRequest = FastifyRequest<any>;
type AnyFastifyReply = FastifyReply<any>;

// Listar todas as permissões disponíveis
export async function listPermissoesController(_req: AnyFastifyRequest, reply: AnyFastifyReply) {
  try {
    const permissoes = await getAllPermissoes();
    reply.code(200).send(serializeBigInt({
      permissoes,
      modulos: MODULOS,
      acoes: ACOES,
    }));
  } catch (err: any) {
    reply.code(500).send({
      error: "FETCH_FAILED",
      message: err?.message ?? "Falha ao buscar permissões.",
    });
  }
}

// Listar todos os perfis com contagem de usuários
export async function listPerfisController(_req: AnyFastifyRequest, reply: AnyFastifyReply) {
  try {
    const perfis = await getAllPerfis();
    reply.code(200).send(serializeBigInt(perfis));
  } catch (err: any) {
    reply.code(500).send({
      error: "FETCH_FAILED",
      message: err?.message ?? "Falha ao buscar perfis.",
    });
  }
}

// Obter permissões de um perfil específico
export async function getPermissoesPerfilController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const { perfilId } = (req.params as any) as { perfilId: string };

  try {
    const perfilIdNum = parseInt(perfilId, 10);
    if (isNaN(perfilIdNum)) {
      reply.code(400).send({
        error: "INVALID_ID",
        message: "ID do perfil inválido.",
      });
      return;
    }

    const perfil = await getPerfilById(perfilIdNum);
    if (!perfil) {
      reply.code(404).send({
        error: "NOT_FOUND",
        message: "Perfil não encontrado.",
      });
      return;
    }

    const permissoes = await getPermissoesByPerfil(perfilIdNum);
    reply.code(200).send(serializeBigInt({
      perfil: {
        PK_perfil_id: perfil.PK_perfil_id,
        nome: perfil.nome,
        descricao: perfil.descricao,
      },
      permissoes,
    }));
  } catch (err: any) {
    reply.code(500).send({
      error: "FETCH_FAILED",
      message: err?.message ?? "Falha ao buscar permissões do perfil.",
    });
  }
}

// Atualizar permissões de um perfil
export async function updatePermissoesPerfilController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const { perfilId } = (req.params as any) as { perfilId: string };
  const body = req.body as {
    permissoes: Array<{ fk_permissao_id: number; ativo: boolean }>;
  };

  try {
    const perfilIdNum = parseInt(perfilId, 10);
    if (isNaN(perfilIdNum)) {
      reply.code(400).send({
        error: "INVALID_ID",
        message: "ID do perfil inválido.",
      });
      return;
    }

    if (!body.permissoes || !Array.isArray(body.permissoes)) {
      reply.code(400).send({
        error: "INVALID_BODY",
        message: "Lista de permissões inválida.",
      });
      return;
    }

    const perfil = await getPerfilById(perfilIdNum);
    if (!perfil) {
      reply.code(404).send({
        error: "NOT_FOUND",
        message: "Perfil não encontrado.",
      });
      return;
    }

    // Não permitir editar permissões do perfil Admin (ID 1)
    if (perfilIdNum === 1) {
      reply.code(403).send({
        error: "FORBIDDEN",
        message: "Não é permitido editar permissões do perfil Admin.",
      });
      return;
    }

    const permissoesAtualizadas = await updatePermissoesPerfil(perfilIdNum, body.permissoes);

    reply.code(200).send(serializeBigInt({
      success: true,
      message: "Permissões atualizadas com sucesso.",
      permissoes: permissoesAtualizadas,
    }));
  } catch (err: any) {
    reply.code(500).send({
      error: "UPDATE_FAILED",
      message: err?.message ?? "Falha ao atualizar permissões.",
    });
  }
}
