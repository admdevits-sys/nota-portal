import argon2 from "argon2";
import crypto from "node:crypto";
import { prisma } from "./prisma.config.js";
async function main() {
    const perfis = [
        {
            nome: "ADMIN",
            descricao: "Acesso total ao sistema",
        },
        {
            nome: "OPERADOR",
            descricao: "Operações de importação e gestão",
        },
        {
            nome: "AUDITOR",
            descricao: "Acesso apenas para auditoria e relatórios",
        },
    ];
    for (const p of perfis) {
        await prisma.perfis.upsert({
            where: { nome: p.nome },
            update: { descricao: p.descricao },
            create: { nome: p.nome, descricao: p.descricao },
        });
    }
    const adminEmail = "admin@nota.dev";
    const adminPerfil = await prisma.perfis.findUnique({ where: { nome: "ADMIN" } });
    if (!adminPerfil) {
        throw new Error("Perfil ADMIN não encontrado durante a seed.");
    }
    const existingAdmin = await prisma.usuarios.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        const senhaHash = await argon2.hash("Admin123!");
        await prisma.usuarios.create({
            data: {
                PK_usuario_id: crypto.randomUUID(),
                fk_perfil_id: adminPerfil.PK_perfil_id,
                nome: "Administrador do Sistema",
                email: adminEmail,
                senha_hash: senhaHash,
                ativo: true,
            },
        });
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
