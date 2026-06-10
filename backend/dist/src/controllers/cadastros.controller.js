import { empresaCreateSchema, empresaUpdateSchema, paginationQuerySchema, produtoCreateSchema, produtoUpdateSchema, servicoCreateSchema, servicoUpdateSchema, usuarioCreateSchema, usuarioUpdateSchema, } from "../schemas/cadastros.schemas.js";
import { createEmpresa, createProduto, createServico, createUsuario, deactivateUsuario, activateUsuario, deleteUsuario, deleteEmpresa, deleteProduto, deleteServico, getEmpresaById, getEmpresas, getProdutoById, getProdutos, getServicoById, getServicos, getUsuarioById, getUsuarios, updateEmpresa, updateProduto, updateServico, updateUsuario, } from "../services/cadastros.service.js";
export async function listUsuariosController(req, reply) {
    const query = paginationQuerySchema.parse(req.query ?? {});
    const data = await getUsuarios(query.page, query.pageSize);
    reply.send(data);
}
export async function getUsuarioController(req, reply) {
    const usuarioId = String(req.params.id);
    const data = await getUsuarioById(usuarioId);
    if (!data) {
        reply.code(404).send({ error: "NOT_FOUND" });
        return;
    }
    reply.send(data);
}
export async function createUsuarioController(req, reply) {
    const payload = usuarioCreateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    try {
        const user = await createUsuario(payload.data);
        reply.code(201).send(user);
    }
    catch (err) {
        if (err?.code === "EMAIL_ALREADY_EXISTS") {
            reply.code(409).send({ error: "EMAIL_ALREADY_EXISTS" });
            return;
        }
        if (err?.code === "PERFIL_INVALIDO") {
            reply.code(400).send({ error: "PERFIL_INVALIDO" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function updateUsuarioController(req, reply) {
    const usuarioId = String(req.params.id);
    const payload = usuarioUpdateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    try {
        const user = await updateUsuario(usuarioId, payload.data);
        reply.send(user);
    }
    catch (err) {
        if (err?.code === "EMAIL_ALREADY_EXISTS") {
            reply.code(409).send({ error: "EMAIL_ALREADY_EXISTS" });
            return;
        }
        if (err?.code === "PERFIL_INVALIDO") {
            reply.code(400).send({ error: "PERFIL_INVALIDO" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function deactivateUsuarioController(req, reply) {
    const usuarioId = String(req.params.id);
    const force = String(req.query.force) === "true" || String(req.query.hard) === "true";
    try {
        if (force) {
            await deleteUsuario(usuarioId);
        }
        else {
            await deactivateUsuario(usuarioId);
        }
        reply.code(204).send();
    }
    catch (err) {
        if (err?.code === "USUARIO_COM_IMPORTACOES") {
            reply.code(409).send({ error: "USUARIO_COM_IMPORTACOES" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function activateUsuarioController(req, reply) {
    const usuarioId = String(req.params.id);
    try {
        await activateUsuario(usuarioId);
        reply.code(204).send();
    }
    catch (err) {
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function listEmpresasController(req, reply) {
    const query = paginationQuerySchema.parse(req.query ?? {});
    const data = await getEmpresas(query.page, query.pageSize, query.q);
    reply.send(data);
}
export async function getEmpresaController(req, reply) {
    const id = String(req.params.id);
    const data = await getEmpresaById(id);
    if (!data) {
        reply.code(404).send({ error: "NOT_FOUND" });
        return;
    }
    reply.send(data);
}
export async function createEmpresaController(req, reply) {
    const payload = empresaCreateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    try {
        const data = await createEmpresa(payload.data);
        reply.code(201).send(data);
    }
    catch (err) {
        if (err?.code === "EMPRESA_JA_EXISTE") {
            reply.code(409).send({ error: "EMPRESA_JA_EXISTE" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function updateEmpresaController(req, reply) {
    const id = String(req.params.id);
    const payload = empresaUpdateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    const data = await updateEmpresa(id, payload.data);
    reply.send(data);
}
export async function deleteEmpresaController(req, reply) {
    const id = String(req.params.id);
    try {
        await deleteEmpresa(id);
        reply.code(204).send();
    }
    catch (err) {
        if (err?.code === "EMPRESA_COM_NOTAS") {
            reply.code(409).send({ error: "EMPRESA_COM_NOTAS" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function listProdutosController(req, reply) {
    const query = paginationQuerySchema.parse(req.query ?? {});
    const data = await getProdutos(query.page, query.pageSize, query.q);
    reply.send(data);
}
export async function getProdutoController(req, reply) {
    const id = String(req.params.id);
    const data = await getProdutoById(id);
    if (!data) {
        reply.code(404).send({ error: "NOT_FOUND" });
        return;
    }
    reply.send(data);
}
export async function createProdutoController(req, reply) {
    const payload = produtoCreateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    try {
        const data = await createProduto(payload.data);
        reply.code(201).send(data);
    }
    catch (err) {
        if (err?.code === "PRODUTO_JA_EXISTE") {
            reply.code(409).send({ error: "PRODUTO_JA_EXISTE" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function updateProdutoController(req, reply) {
    const id = String(req.params.id);
    const payload = produtoUpdateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    const data = await updateProduto(id, payload.data);
    reply.send(data);
}
export async function deleteProdutoController(req, reply) {
    const id = String(req.params.id);
    try {
        await deleteProduto(id);
        reply.code(204).send();
    }
    catch (err) {
        if (err?.code === "PRODUTO_COM_ITENS") {
            reply.code(409).send({ error: "PRODUTO_COM_ITENS" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function listServicosController(req, reply) {
    const query = paginationQuerySchema.parse(req.query ?? {});
    const data = await getServicos(query.page, query.pageSize, query.q);
    reply.send(data);
}
export async function getServicoController(req, reply) {
    const id = String(req.params.id);
    const data = await getServicoById(id);
    if (!data) {
        reply.code(404).send({ error: "NOT_FOUND" });
        return;
    }
    reply.send(data);
}
export async function createServicoController(req, reply) {
    const payload = servicoCreateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    try {
        const data = await createServico(payload.data);
        reply.code(201).send(data);
    }
    catch (err) {
        if (err?.code === "SERVICO_JA_EXISTE") {
            reply.code(409).send({ error: "SERVICO_JA_EXISTE" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
export async function updateServicoController(req, reply) {
    const id = String(req.params.id);
    const payload = servicoUpdateSchema.safeParse(req.body);
    if (!payload.success) {
        reply.code(400).send({ error: "BAD_REQUEST", details: payload.error.flatten() });
        return;
    }
    const data = await updateServico(id, payload.data);
    reply.send(data);
}
export async function deleteServicoController(req, reply) {
    const id = String(req.params.id);
    try {
        await deleteServico(id);
        reply.code(204).send();
    }
    catch (err) {
        if (err?.code === "SERVICO_COM_ITENS") {
            reply.code(409).send({ error: "SERVICO_COM_ITENS" });
            return;
        }
        reply.code(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
}
