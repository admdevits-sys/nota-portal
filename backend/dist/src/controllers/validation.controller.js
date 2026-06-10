import { validateXmlByChaveService, getValidationHistory } from "../services/xml-validation.service.js";
import { prisma } from "../db/prisma.js";
/**
 * Valida nota fiscal pela chave de acesso (sem upload de XML)
 */
export async function validateByChaveController(req, reply) {
    const { chaveAcesso, tipoDocumento } = req.body;
    const user = req.user;
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
    }
    catch (err) {
        reply.code(500).send({
            error: "VALIDATION_FAILED",
            message: err?.message ?? "Falha ao validar nota fiscal.",
        });
    }
}
/**
 * Lista histórico de validações
 */
export async function getValidacoesController(req, reply) {
    const query = req.query;
    const page = parseInt(query.page ?? "1", 10);
    const limit = parseInt(query.limit ?? "20", 10);
    const user = req.user;
    try {
        const result = await getValidationHistory(user.usuarioId, page, limit);
        reply.code(200).send(result);
    }
    catch (err) {
        reply.code(500).send({
            error: "QUERY_FAILED",
            message: err?.message ?? "Falha ao consultar validações.",
        });
    }
}
/**
 * Busca validação por chave de acesso
 */
export async function getValidacaoByChaveController(req, reply) {
    const { chaveAcesso } = req.params;
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
    }
    catch (err) {
        reply.code(500).send({
            error: "QUERY_FAILED",
            message: err?.message ?? "Falha ao consultar validação.",
        });
    }
}
