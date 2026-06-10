import { prisma } from "../db/prisma.js";
export async function createAuditLog(input) {
    return prisma.logs_auditoria.create({
        data: {
            fk_usuario_id: input.fk_usuario_id ?? null,
            acao: input.acao,
            tabela_afetada: input.tabela_afetada ?? null,
            registro_afetado_id: input.registro_afetado_id ?? null,
            endereco_ip: input.endereco_ip,
            agente_usuario: input.agente_usuario,
            detalhes: input.detalhes != null ? JSON.stringify(input.detalhes) : undefined,
        },
    });
}
