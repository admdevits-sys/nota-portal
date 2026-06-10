import { prisma } from "../db/prisma.js";
import type { Prisma } from "@prisma/client";

// Módulos disponíveis no sistema
export const MODULOS = [
  { key: "DASHBOARD", label: "Dashboard", descricao: "Painel de resumo" },
  { key: "IMPORTACAO", label: "Importação XML", descricao: "Importação de arquivos XML" },
  { key: "VALIDACAO", label: "Validação XML", descricao: "Validação de notas fiscais" },
  { key: "NOTAS", label: "Notas Fiscais", descricao: "Gestão de notas fiscais" },
  { key: "USUARIOS", label: "Usuários", descricao: "Gestão de usuários" },
  { key: "CADASTROS", label: "Cadastros", descricao: "Cadastros diversos" },
  { key: "LOGS", label: "Logs do Sistema", descricao: "Logs e auditoria" },
  { key: "CONFIG", label: "Configurações", descricao: "Configurações do sistema" },
] as const;

export type ModuloKey = typeof MODULOS[number]["key"];

// Ações disponíveis no sistema
export const ACOES = [
  { key: "VIEW", label: "Visualizar", descricao: "Pode visualizar" },
  { key: "CREATE", label: "Criar", descricao: "Pode criar registros" },
  { key: "UPDATE", label: "Editar", descricao: "Pode editar registros" },
  { key: "DELETE", label: "Excluir", descricao: "Pode excluir registros" },
  { key: "EXPORT", label: "Exportar", descricao: "Pode exportar dados" },
] as const;

export type AcaoKey = typeof ACOES[number]["key"];

// Obter todas as permissões do sistema
export async function getAllPermissoes() {
  const permissoes = await prisma.permissoes.findMany({
    orderBy: [{ modulo: "asc" }, { acao: "asc" }],
  });
  return permissoes;
}

// Obter todas as permissões por módulo
export async function getPermissoesByModulo(modulo: string) {
  const permissoes = await prisma.permissoes.findMany({
    where: { modulo },
    orderBy: { acao: "asc" },
  });
  return permissoes;
}

// Obter permissões de um perfil
export async function getPermissoesByPerfil(perfilId: number) {
  const permissoesPerfil = await prisma.permissoes_perfis.findMany({
    where: { fk_perfil_id: perfilId },
    include: {
      permissao: true,
    },
  });
  return permissoesPerfil;
}

// Obter permissões de um perfil filtradas por módulo
export async function getPermissoesByPerfilAndModulo(perfilId: number, modulo: string) {
  const permissoesPerfil = await prisma.permissoes_perfis.findMany({
    where: {
      fk_perfil_id: perfilId,
      ativo: true,
      permissao: { modulo },
    },
    include: {
      permissao: true,
    },
  });
  return permissoesPerfil;
}

// Atualizar permissões de um perfil
export async function updatePermissoesPerfil(
  perfilId: number,
  permissoes: Array<{ fk_permissao_id: number; ativo: boolean }>
) {
  // Usar transaction para atualizar
  return prisma.$transaction(async (tx) => {
    // Primeiro desativar todas as permissões do perfil
    await tx.permissoes_perfis.updateMany({
      where: { fk_perfil_id: perfilId },
      data: { ativo: false },
    });

    // Depois ativar/desativar conforme especificado
    for (const perm of permissoes) {
      await tx.permissoes_perfis.upsert({
        where: {
          uk_perfil_permissao: {
            fk_perfil_id: perfilId,
            fk_permissao_id: perm.fk_permissao_id,
          },
        },
        create: {
          fk_perfil_id: perfilId,
          fk_permissao_id: perm.fk_permissao_id,
          ativo: perm.ativo,
        },
        update: {
          ativo: perm.ativo,
        },
      });
    }

    // Retornar permissões atualizadas
    return getPermissoesByPerfil(perfilId);
  });
}

// Verificar se um perfil tem uma permissão específica
export async function verificarPermissao(
  perfilId: number,
  modulo: string,
  acao: string
): Promise<boolean> {
  const permissao = await prisma.permissoes_perfis.findFirst({
    where: {
      fk_perfil_id: perfilId,
      ativo: true,
      permissao: {
        modulo,
        acao,
      },
    },
  });
  return !!permissao;
}

// Obter todos os perfis
export async function getAllPerfis() {
  return prisma.perfis.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: {
        select: { usuarios: true },
      },
    },
  });
}

// Obter perfil por ID
export async function getPerfilById(perfilId: number) {
  return prisma.perfis.findUnique({
    where: { PK_perfil_id: perfilId },
    include: {
      permissoes: {
        include: {
          permissao: true,
        },
      },
    },
  });
}

// Obter perfil por nome
export async function getPerfilByNome(nome: string) {
  return prisma.perfis.findUnique({
    where: { nome },
    include: {
      permissoes: {
        include: {
          permissao: true,
        },
      },
    },
  });
}
