import { getFaturamentoTotal, getFluxoCaixa, getImportacoesStatusCount, getImpostosResumo, getNotasPaginadas, getTopClientes, getTopProdutos, } from "../services/dashboard/dashboard.service.js";
export async function statusCountController(_req, reply) {
    const data = await getImportacoesStatusCount();
    reply.send({ data });
}
export async function faturamentoTotalController(_req, reply) {
    const data = await getFaturamentoTotal();
    reply.send(data);
}
export async function fluxoCaixaController(_req, reply) {
    const data = await getFluxoCaixa();
    reply.send({ data });
}
export async function topClientesController(_req, reply) {
    const data = await getTopClientes();
    reply.send({ data });
}
export async function topProdutosController(_req, reply) {
    const data = await getTopProdutos();
    reply.send({ data });
}
export async function impostosResumoController(_req, reply) {
    const data = await getImpostosResumo();
    reply.send({ data });
}
export async function notasController(req, reply) {
    const query = req.query ?? {};
    const page = query.page ? Number(query.page) : 1;
    const pageSize = query.pageSize ? Number(query.pageSize) : 20;
    const tipo_documento = query.tipo_documento
        ? String(query.tipo_documento)
        : undefined;
    const data_ini = query.data_ini ? String(query.data_ini) : undefined;
    const data_fim = query.data_fim ? String(query.data_fim) : undefined;
    const documento_emitente = query.documento_emitente
        ? String(query.documento_emitente)
        : undefined;
    const data = await getNotasPaginadas({
        page,
        pageSize,
        tipo_documento: tipo_documento === "NFE" || tipo_documento === "NFSE" ? tipo_documento : undefined,
        data_ini,
        data_fim,
        documento_emitente,
    });
    reply.send(data);
}
