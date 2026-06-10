import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export type AuditLogInput = {
  fk_usuario_id?: string;
  acao: string;
  tabela_afetada?: string;
  registro_afetado_id?: string;
  endereco_ip: string;
  agente_usuario: string;
  detalhes?: Prisma.JsonValue;
};

export async function createAuditLog(input: AuditLogInput) {
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
