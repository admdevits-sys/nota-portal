import argon2 from "argon2";
import crypto from "node:crypto";
import { prisma } from "../db/prisma.js";
export async function getUsuarios(page, pageSize) {
    const skip = (page - 1) * pageSize;
    const [totalCount, items] = await Promise.all([
        prisma.usuarios.count(),
        prisma.usuarios.findMany({
            skip,
            take: pageSize,
            orderBy: { data_criacao: "desc" },
            select: {
                PK_usuario_id: true,
                nome: true,
                email: true,
                ativo: true,
                data_criacao: true,
                fk_perfil_id: true,
                perfil: { select: { nome: true } },
                _count: { select: { importacoes: true } },
            },
        }),
    ]);
    return {
        data: items.map((user) => ({
            usuarioId: user.PK_usuario_id,
            nome: user.nome,
            email: user.email,
            ativo: user.ativo,
            perfilNome: user.perfil.nome,
            perfilId: user.fk_perfil_id,
            data_criacao: user.data_criacao,
            canDelete: user._count.importacoes === 0,
        })),
        meta: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        },
    };
}
export async function getUsuarioById(usuarioId) {
    return prisma.usuarios.findUnique({
        where: { PK_usuario_id: usuarioId },
        select: {
            PK_usuario_id: true,
            nome: true,
            email: true,
            ativo: true,
            fk_perfil_id: true,
            perfil: { select: { nome: true } },
            data_criacao: true,
            data_atualizacao: true,
        },
    });
}
export async function createUsuario(input) {
    const existing = await prisma.usuarios.findUnique({ where: { email: input.email } });
    if (existing) {
        const err = new Error("EMAIL_ALREADY_EXISTS");
        err.code = "EMAIL_ALREADY_EXISTS";
        throw err;
    }
    const perfil = await prisma.perfis.findUnique({ where: { nome: input.perfilNome } });
    if (!perfil) {
        const err = new Error("PERFIL_INVALIDO");
        err.code = "PERFIL_INVALIDO";
        throw err;
    }
    const senha_hash = await argon2.hash(input.senha);
    const user = await prisma.usuarios.create({
        data: {
            PK_usuario_id: crypto.randomUUID(),
            fk_perfil_id: perfil.PK_perfil_id,
            nome: input.nome,
            email: input.email,
            senha_hash,
            ativo: input.ativo,
        },
    });
    return {
        usuarioId: user.PK_usuario_id,
        nome: user.nome,
        email: user.email,
        perfilNome: perfil.nome,
        perfilId: perfil.PK_perfil_id,
        ativo: user.ativo,
    };
}
export async function updateUsuario(usuarioId, input) {
    if (input.email) {
        const existing = await prisma.usuarios.findUnique({ where: { email: input.email } });
        if (existing && existing.PK_usuario_id !== usuarioId) {
            const err = new Error("EMAIL_ALREADY_EXISTS");
            err.code = "EMAIL_ALREADY_EXISTS";
            throw err;
        }
    }
    const data = {};
    if (input.nome)
        data.nome = input.nome;
    if (input.email)
        data.email = input.email;
    if (input.perfilNome) {
        const perfil = await prisma.perfis.findUnique({ where: { nome: input.perfilNome } });
        if (!perfil) {
            const err = new Error("PERFIL_INVALIDO");
            err.code = "PERFIL_INVALIDO";
            throw err;
        }
        data.fk_perfil_id = perfil.PK_perfil_id;
    }
    if (typeof input.ativo === "boolean")
        data.ativo = input.ativo;
    if (input.senha)
        data.senha_hash = await argon2.hash(input.senha);
    return prisma.usuarios.update({
        where: { PK_usuario_id: usuarioId },
        data,
    });
}
export async function deactivateUsuario(usuarioId) {
    return prisma.usuarios.update({
        where: { PK_usuario_id: usuarioId },
        data: { ativo: false },
    });
}
export async function activateUsuario(usuarioId) {
    return prisma.usuarios.update({
        where: { PK_usuario_id: usuarioId },
        data: { ativo: true },
    });
}
export async function deleteUsuario(usuarioId) {
    const importacoesCount = await prisma.importacoes.count({ where: { fk_usuario_id: usuarioId } });
    if (importacoesCount > 0) {
        const err = new Error("USUARIO_COM_IMPORTACOES");
        err.code = "USUARIO_COM_IMPORTACOES";
        throw err;
    }
    await prisma.$transaction([
        prisma.logs_auditoria.updateMany({ where: { fk_usuario_id: usuarioId }, data: { fk_usuario_id: null } }),
        prisma.usuarios.delete({ where: { PK_usuario_id: usuarioId } }),
    ]);
}
export async function getEmpresas(page, pageSize, q) {
    const skip = (page - 1) * pageSize;
    const where = q
        ? {
            OR: [
                { razao_social: { contains: q, mode: "insensitive" } },
                { nome_fantasia: { contains: q, mode: "insensitive" } },
                { cnpj_cpf: { contains: q, mode: "insensitive" } },
                { cidade: { contains: q, mode: "insensitive" } },
            ],
        }
        : {};
    const [totalCount, items] = await Promise.all([
        prisma.empresas.count({ where }),
        prisma.empresas.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { data_criacao: "desc" },
        }),
    ]);
    return {
        data: items,
        meta: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        },
    };
}
export async function getEmpresaById(PK_empresa_id) {
    return prisma.empresas.findUnique({ where: { PK_empresa_id } });
}
export async function createEmpresa(input) {
    const normalizedId = input.cnpj_cpf.replace(/[^0-9]/g, "");
    const existing = await prisma.empresas.findUnique({ where: { cnpj_cpf: normalizedId } });
    if (existing) {
        const err = new Error("EMPRESA_JA_EXISTE");
        err.code = "EMPRESA_JA_EXISTE";
        throw err;
    }
    return prisma.empresas.create({
        data: {
            PK_empresa_id: crypto.randomUUID(),
            ...input,
            cnpj_cpf: normalizedId,
        },
    });
}
export async function updateEmpresa(PK_empresa_id, input) {
    const data = { ...input };
    if (input.cnpj_cpf)
        data.cnpj_cpf = input.cnpj_cpf.replace(/[^0-9]/g, "");
    return prisma.empresas.update({ where: { PK_empresa_id }, data });
}
export async function deleteEmpresa(PK_empresa_id) {
    const linked = await prisma.notas_fiscais.count({
        where: {
            OR: [
                { fk_empresa_emitente_id: PK_empresa_id },
                { fk_empresa_destinatario_id: PK_empresa_id },
            ],
        },
    });
    if (linked > 0) {
        const err = new Error("EMPRESA_COM_NOTAS");
        err.code = "EMPRESA_COM_NOTAS";
        throw err;
    }
    return prisma.empresas.delete({ where: { PK_empresa_id } });
}
export async function getProdutos(page, pageSize, q) {
    const skip = (page - 1) * pageSize;
    const where = q
        ? {
            OR: [
                { codigo: { contains: q, mode: "insensitive" } },
                { descricao: { contains: q, mode: "insensitive" } },
                { ncm: { contains: q, mode: "insensitive" } },
            ],
        }
        : {};
    const [totalCount, items] = await Promise.all([
        prisma.produtos_cadastrados.count({ where }),
        prisma.produtos_cadastrados.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { data_criacao: "desc" },
        }),
    ]);
    return {
        data: items,
        meta: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        },
    };
}
export async function getProdutoById(PK_produto_id) {
    return prisma.produtos_cadastrados.findUnique({ where: { PK_produto_id } });
}
export async function createProduto(input) {
    const existing = await prisma.produtos_cadastrados.findUnique({ where: { codigo: input.codigo } });
    if (existing) {
        const err = new Error("PRODUTO_JA_EXISTE");
        err.code = "PRODUTO_JA_EXISTE";
        throw err;
    }
    return prisma.produtos_cadastrados.create({
        data: {
            PK_produto_id: crypto.randomUUID(),
            ...input,
        },
    });
}
export async function updateProduto(PK_produto_id, input) {
    return prisma.produtos_cadastrados.update({ where: { PK_produto_id }, data: input });
}
export async function deleteProduto(PK_produto_id) {
    const linked = await prisma.itens_nota_fiscal.count({ where: { fk_produto_id: PK_produto_id } });
    if (linked > 0) {
        const err = new Error("PRODUTO_COM_ITENS");
        err.code = "PRODUTO_COM_ITENS";
        throw err;
    }
    return prisma.produtos_cadastrados.delete({ where: { PK_produto_id } });
}
export async function getServicos(page, pageSize, q) {
    const skip = (page - 1) * pageSize;
    const where = q
        ? {
            OR: [
                { codigo: { contains: q, mode: "insensitive" } },
                { descricao: { contains: q, mode: "insensitive" } },
                { categoria: { contains: q, mode: "insensitive" } },
            ],
        }
        : {};
    const [totalCount, items] = await Promise.all([
        prisma.servicos_cadastrados.count({ where }),
        prisma.servicos_cadastrados.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { data_criacao: "desc" },
        }),
    ]);
    return {
        data: items,
        meta: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        },
    };
}
export async function getServicoById(PK_servico_id) {
    return prisma.servicos_cadastrados.findUnique({ where: { PK_servico_id } });
}
export async function createServico(input) {
    const existing = await prisma.servicos_cadastrados.findUnique({ where: { codigo: input.codigo } });
    if (existing) {
        const err = new Error("SERVICO_JA_EXISTE");
        err.code = "SERVICO_JA_EXISTE";
        throw err;
    }
    return prisma.servicos_cadastrados.create({
        data: {
            PK_servico_id: crypto.randomUUID(),
            ...input,
        },
    });
}
export async function updateServico(PK_servico_id, input) {
    return prisma.servicos_cadastrados.update({ where: { PK_servico_id }, data: input });
}
export async function deleteServico(PK_servico_id) {
    const linked = await prisma.servicos_nota_fiscal.count({ where: { fk_servico_id: PK_servico_id } });
    if (linked > 0) {
        const err = new Error("SERVICO_COM_ITENS");
        err.code = "SERVICO_COM_ITENS";
        throw err;
    }
    return prisma.servicos_cadastrados.delete({ where: { PK_servico_id } });
}
