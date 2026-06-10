import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export type LogSistemaInput = {
  fk_usuario_id?: string;
  modulo: string;
  acao: string;
  tabela_afetada?: string;
  registro_afetado_id?: string;
  descricao: string;
  detalhes?: Prisma.JsonValue;
  endereco_ip: string;
  agente_usuario: string;
};

export async function createLogSistema(input: LogSistemaInput) {
  return prisma.logs_sistema.create({
    data: {
      fk_usuario_id: input.fk_usuario_id ?? null,
      modulo: input.modulo,
      acao: input.acao,
      tabela_afetada: input.tabela_afetada ?? null,
      registro_afetado_id: input.registro_afetado_id ?? null,
      descricao: input.descricao,
      detalhes: input.detalhes != null ? JSON.stringify(input.detalhes) : undefined,
      endereco_ip: input.endereco_ip,
      agente_usuario: input.agente_usuario,
    },
  });
}

export type ListLogsSistemaFilters = {
  fk_usuario_id?: string;
  modulo?: string;
  acao?: string;
  data_inicio?: Date;
  data_fim?: Date;
  page?: number;
  pageSize?: number;
};

export async function listLogsSistema(filters: ListLogsSistemaFilters) {
  const {
    fk_usuario_id,
    modulo,
    acao,
    data_inicio,
    data_fim,
    page = 1,
    pageSize = 50,
  } = filters;

  const where: Prisma.logs_sistemaWhereInput = {};

  if (fk_usuario_id) where.fk_usuario_id = fk_usuario_id;
  if (modulo) where.modulo = modulo;
  if (acao) where.acao = acao;
  if (data_inicio || data_fim) {
    where.data_criacao = {};
    if (data_inicio) where.data_criacao.gte = data_inicio;
    if (data_fim) where.data_criacao.lte = data_fim;
  }

  const [logs, total] = await Promise.all([
    prisma.logs_sistema.findMany({
      where,
      include: {
        usuario: {
          select: {
            PK_usuario_id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { data_criacao: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.logs_sistema.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
