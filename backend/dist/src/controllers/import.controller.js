import { importXmlService } from "../services/import/importXml.service.js";
import { prisma } from "../db/prisma.js";
export async function uploadXmlController(req, reply) {
    const file = await req.file?.();
    if (!file) {
        reply
            .code(400)
            .send({ error: "BAD_REQUEST", message: "Arquivo XML ausente." });
        return;
    }
    const originalName = file.filename ?? "arquivo.xml";
    const user = req.user;
    try {
        const result = await importXmlService({
            usuarioId: user.usuarioId,
            nomeArquivo: originalName,
            stream: file.file,
            tamanhoBytes: typeof file.file?.readableLength === "number"
                ? file.file.readableLength
                : null,
        });
        reply.code(201).send(result);
    }
    catch (err) {
        reply.code(500).send({
            error: "IMPORT_FAILED",
            message: err?.message ?? "Falha ao importar XML.",
        });
    }
}
export async function deleteNotaController(req, reply) {
    const { notaId } = req.params;
    try {
        // Buscar a nota para verificar se existe
        const nota = await prisma.notas_fiscais.findUnique({
            where: { PK_nota_fiscal_id: notaId },
        });
        if (!nota) {
            reply.code(404).send({
                error: "NOT_FOUND",
                message: "Nota fiscal não encontrada.",
            });
            return;
        }
        // Executar exclusão em transaction
        await prisma.$transaction(async (tx) => {
            // 1. Excluir duplicatas financeiras
            await tx.duplicatas_financeiras.deleteMany({
                where: { fk_nota_fiscal_id: notaId },
            });
            // 2. Excluir dados de transporte
            await tx.dados_transporte.deleteMany({
                where: { fk_nota_fiscal_id: notaId },
            });
            // 3. Excluir serviços da nota
            await tx.servicos_nota_fiscal.deleteMany({
                where: { fk_nota_fiscal_id: notaId },
            });
            // 4. Excluir itens da nota (produtos)
            await tx.itens_nota_fiscal.deleteMany({
                where: { fk_nota_fiscal_id: notaId },
            });
            // 5. Excluir impostos
            await tx.impostos_nota.deleteMany({
                where: { fk_nota_fiscal_id: notaId },
            });
            // 6. Excluir a nota fiscal
            await tx.notas_fiscais.delete({
                where: { PK_nota_fiscal_id: notaId },
            });
            // 7. Opcional: Excluir a importação associada se não tiver outras notas
            if (nota.fk_importacao_id) {
                const outrasNotas = await tx.notas_fiscais.count({
                    where: {
                        fk_importacao_id: nota.fk_importacao_id,
                        PK_nota_fiscal_id: { not: notaId },
                    },
                });
                if (outrasNotas === 0) {
                    await tx.importacoes.delete({
                        where: { PK_importacao_id: nota.fk_importacao_id },
                    });
                }
            }
        });
        reply.code(200).send({ success: true, message: "Nota fiscal excluída com sucesso." });
    }
    catch (err) {
        reply.code(500).send({
            error: "DELETE_FAILED",
            message: err?.message ?? "Falha ao excluir nota fiscal.",
        });
    }
}
