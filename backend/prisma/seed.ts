import argon2 from "argon2";
import crypto from "node:crypto";
import { prisma } from "./prisma.config.js";

async function main() {
  // ----------------------
  // Perfis
  // ----------------------
  const perfis = [
    { nome: "ADMIN", descricao: "Acesso total ao sistema" },
    { nome: "OPERADOR", descricao: "Operações de importação e gestão" },
    { nome: "AUDITOR", descricao: "Acesso apenas para auditoria e relatórios" },
  ];

  const perfisMap: Record<string, number> = {};
  for (const p of perfis) {
    const perfil = await prisma.perfis.upsert({
      where: { nome: p.nome },
      update: { descricao: p.descricao },
      create: { nome: p.nome, descricao: p.descricao },
    });
    perfisMap[p.nome] = perfil.PK_perfil_id;
  }

  // ----------------------
  // Permissões
  // ----------------------
  const modulos = ["DASHBOARD", "IMPORTACAO", "NOTAS", "USUARIOS", "VALIDACAO", "CADASTROS", "LOGS", "CONFIG"] as const;
  const acoes = ["VIEW", "CREATE", "UPDATE", "DELETE", "EXPORT"] as const;

  const permissoesMap: Record<string, bigint> = {};
  for (const modulo of modulos) {
    for (const acao of acoes) {
      const permissao = await prisma.permissoes.upsert({
        where: { uk_permissao_modulo_acao: { modulo, acao } },
        update: {},
        create: {
          modulo,
          acao,
          descricao: `${acao} em ${modulo}`,
        },
      });
      permissoesMap[`${modulo}:${acao}`] = permissao.PK_permissao_id;
    }
  }

  // ----------------------
  // Mapeamento perfis ↔ permissões
  // ----------------------
  // ADMIN: todas as permissões
  for (const modulo of modulos) {
    for (const acao of acoes) {
      await prisma.permissoes_perfis.upsert({
        where: { uk_perfil_permissao: { fk_perfil_id: perfisMap["ADMIN"], fk_permissao_id: permissoesMap[`${modulo}:${acao}`] } },
        update: {},
        create: { fk_perfil_id: perfisMap["ADMIN"], fk_permissao_id: permissoesMap[`${modulo}:${acao}`] },
      });
    }
  }

  // OPERADOR: todas exceto USUARIOS (DELETE) e CONFIG
  const operadorAcoes = acoes; // VIEW, CREATE, UPDATE, DELETE, EXPORT
  for (const modulo of modulos) {
    if (modulo === "CONFIG") continue;
    for (const acao of operadorAcoes) {
      if (modulo === "USUARIOS" && acao === "DELETE") continue;
      await prisma.permissoes_perfis.upsert({
        where: { uk_perfil_permissao: { fk_perfil_id: perfisMap["OPERADOR"], fk_permissao_id: permissoesMap[`${modulo}:${acao}`] } },
        update: {},
        create: { fk_perfil_id: perfisMap["OPERADOR"], fk_permissao_id: permissoesMap[`${modulo}:${acao}`] },
      });
    }
  }

  // AUDITOR: apenas VIEW em DASHBOARD, NOTAS, VALIDACAO, LOGS
  const auditorModulos = ["DASHBOARD", "NOTAS", "VALIDACAO", "LOGS"] as const;
  for (const modulo of auditorModulos) {
    await prisma.permissoes_perfis.upsert({
      where: { uk_perfil_permissao: { fk_perfil_id: perfisMap["AUDITOR"], fk_permissao_id: permissoesMap[`${modulo}:VIEW`] } },
      update: {},
      create: { fk_perfil_id: perfisMap["AUDITOR"], fk_permissao_id: permissoesMap[`${modulo}:VIEW`] },
    });
  }

  // ----------------------
  // Usuário admin
  // ----------------------
  const adminEmail = "admin@nota.dev";
  const existingAdmin = await prisma.usuarios.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const senhaHash = await argon2.hash("Admin123!");
    await prisma.usuarios.create({
      data: {
        PK_usuario_id: crypto.randomUUID(),
        fk_perfil_id: perfisMap["ADMIN"],
        nome: "Administrador do Sistema",
        email: adminEmail,
        senha_hash: senhaHash,
        ativo: true,
      },
    });
    console.log(`Admin criado: ${adminEmail} / Admin123!`);
  } else {
    console.log("Admin já existe, pulando.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
