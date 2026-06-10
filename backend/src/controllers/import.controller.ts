import { type FastifyReply, type FastifyRequest } from "fastify";
import { importXmlService } from "../services/import/importXml.service.js";
import { prisma } from "../db/prisma.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFastifyRequest = FastifyRequest<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFastifyReply = FastifyReply<any>;

export async function getNotaDetalhadaController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const { notaId } = (req.params as any) as { notaId: string };

  try {
    const nota = await prisma.notas_fiscais.findUnique({
      where: { PK_nota_fiscal_id: notaId },
      include: {
        itens_nota_fiscal: true,
        servicos_nota_fiscal: true,
        impostos_nota: true,
        duplicatas_financeiras: true,
        dados_transporte: true,
      },
    });

    if (!nota) {
      reply.code(404).send({
        error: "NOT_FOUND",
        message: "Nota fiscal não encontrada.",
      });
      return;
    }

    // Converter BigInt para Number (JSON não suporta BigInt nativamente)
    const notaSerializada = {
      ...nota,
      itens_nota_fiscal: nota.itens_nota_fiscal.map((item) => ({
        ...item,
        PK_item_id: Number(item.PK_item_id),
      })),
      servicos_nota_fiscal: nota.servicos_nota_fiscal.map((serv) => ({
        ...serv,
        PK_servico_id: Number(serv.PK_servico_id),
      })),
      impostos_nota: nota.impostos_nota.map((imp) => ({
        ...imp,
        PK_imposto_id: Number(imp.PK_imposto_id),
      })),
    };

    reply.code(200).send(notaSerializada);
  } catch (err: any) {
    reply.code(500).send({
      error: "FETCH_FAILED",
      message: err?.message ?? "Falha ao buscar nota fiscal.",
    });
  }
}

export async function uploadXmlController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const user = (req as any).user as {
    usuarioId: string;
    perfilId: number;
    email: string;
  };

  // Capturar IP real (considera proxy)
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip =
    typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : req.ip ?? req.socket?.remoteAddress ?? "unknown";

  // User-Agent
  const userAgent = req.headers["user-agent"] ?? "unknown";

  try {
    // Fastify multipart (>=10): preferir req.file() para 1, mas aqui aceitamos múltiplos.
    // Vamos consumir todos os parts de campo 'file'.
    const parts: Array<{
      filename: string;
      file: NodeJS.ReadableStream;
      readableLength?: number;
    }> = [];

    const multipartReq: any = req as any;

    if (typeof multipartReq.files === "function") {
      // Quando disponível, lê todos os arquivos.
      const files = await multipartReq.files();
      for await (const f of files) {
        if (!f) continue;
        parts.push({
          filename: f.filename ?? "arquivo.xml",
          file: f.file,
          readableLength: typeof f?.file?.readableLength === "number" ? f.file.readableLength : undefined,
        });
      }
    } else {
      // Fallback: tentar iterar usando req.file() sucessivo.
      while (true) {
        const f = await multipartReq.file?.();
        if (!f) break;
        parts.push({
          filename: f.filename ?? "arquivo.xml",
          file: f.file,
          readableLength: typeof f?.file?.readableLength === "number" ? f.file.readableLength : undefined,
        });
      }
    }

    const xmlFiles = parts.filter((p) => p.filename.toLowerCase().endsWith(".xml"));

    if (xmlFiles.length === 0) {
      reply
        .code(400)
        .send({ error: "BAD_REQUEST", message: "Nenhum arquivo XML enviado." });
      return;
    }

    const results: Array<{
      nomeArquivo: string;
      status: string;
      importacaoId?: string;
      message?: string;
    }> = [];

    let allSuccess = true;

    // Processar sequencialmente para evitar sobrecarga (e garantir rollback individual do service).
    for (const p of xmlFiles) {
      try {
        const r = await importXmlService({
          usuarioId: user.usuarioId,
          nomeArquivo: p.filename,
          stream: p.file,
          tamanhoBytes:
            typeof p.readableLength === "number" ? p.readableLength : null,
          ip,
          userAgent,
        });

        const status = (r.status as string) ?? "CONCLUIDO";
        results.push({
          nomeArquivo: p.filename,
          status,
          importacaoId: r.importacaoId,
          message: `Importação ${status.toLowerCase()} (${r.registrosProcessados ?? 0}/${r.totalNotas ?? 0})`,
        });

        if (status !== "CONCLUIDO") allSuccess = false;
      } catch (err: any) {
        allSuccess = false;
        results.push({
          nomeArquivo: p.filename,
          status: "FALHOU",
          message: err?.message ?? "Falha ao importar XML.",
        });
      }
    }

    const summaryStatus = allSuccess ? "CONCLUIDO" : "PARCIAL";

    reply.code(allSuccess ? 201 : 207).send({
      status: summaryStatus,
      total: xmlFiles.length,
      results,
    });
  } catch (err: any) {
    reply.code(500).send({
      error: "IMPORT_FAILED",
      message: err?.message ?? "Falha ao importar XML.",
    });
  }
}

export async function deleteNotaController(req: AnyFastifyRequest, reply: AnyFastifyReply) {
  const { notaId } = (req.params as any) as { notaId: string };

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
  } catch (err: any) {
    reply.code(500).send({
      error: "DELETE_FAILED",
      message: err?.message ?? "Falha ao excluir nota fiscal.",
    });
  }
}