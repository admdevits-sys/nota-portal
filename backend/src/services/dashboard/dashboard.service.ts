import { prisma } from "../../db/prisma.js";

export type NotasQuery = {
  page: number;
  pageSize: number;
  tipo_documento?: "NFE" | "NFSE";
  data_ini?: string; // ISO date (yyyy-mm-dd) or full datetime
  data_fim?: string; // ISO date (yyyy-mm-dd) or full datetime
  documento_emitente?: string;
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export async function getImportacoesStatusCount() {
  const rows = await prisma.importacoes.groupBy({
    by: ["status"],
    _count: { PK_importacao_id: true },
  });

  const map: Record<string, number> = {};
  for (const r of rows) map[r.status] = r._count.PK_importacao_id;

  return map;
}

export async function getFaturamentoTotal() {
  const res = await prisma.notas_fiscais.aggregate({
    _sum: { valor_total: true },
  });

  const total = res._sum.valor_total ?? 0;
  return { total };
}

export async function getFluxoCaixa() {
  const rows = await prisma.$queryRaw<Array<{ year: number; month: number; total: string }>>`
    SELECT YEAR(data_emissao) AS year,
           MONTH(data_emissao) AS month,
           SUM(valor_total) AS total
    FROM notas_fiscais
    WHERE data_emissao >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY YEAR(data_emissao), MONTH(data_emissao)
    ORDER BY YEAR(data_emissao), MONTH(data_emissao);
  `;

  return rows.map((row) => ({
    year: Number(row.year),
    month: Number(row.month),
    total: Number(row.total ?? 0),
    label: `${row.year}-${String(row.month).padStart(2, "0")}`,
  }));
}

export async function getTopClientes() {
  const rows = await prisma.$queryRaw<Array<{ documento: string | null; nome: string | null; notas: number; total: string }>>`
    SELECT documento_emitente AS documento,
           nome_emitente AS nome,
           COUNT(*) AS notas,
           SUM(valor_total) AS total
    FROM notas_fiscais
    GROUP BY documento_emitente, nome_emitente
    ORDER BY total DESC
    LIMIT 10;
  `;

  return rows.map((row) => ({
    documento: row.documento ?? "N/A",
    nome: row.nome ?? "Cliente sem nome",
    notas: Number(row.notas),
    total: Number(row.total ?? 0),
  }));
}

export async function getTopProdutos() {
  const rows = await prisma.$queryRaw<Array<{ codigo: string | null; descricao: string | null; quantidade: string; total: string }>>`
    SELECT COALESCE(i.codigo_produto, p.codigo) AS codigo,
           COALESCE(i.descricao, p.descricao) AS descricao,
           SUM(i.quantidade) AS quantidade,
           SUM(i.valor_total) AS total
    FROM itens_nota_fiscal i
    LEFT JOIN produtos_cadastrados p ON i.fk_produto_id = p.PK_produto_id
    GROUP BY codigo, descricao
    ORDER BY SUM(i.quantidade) DESC
    LIMIT 10;
  `;

  return rows.map((row) => ({
    codigo: row.codigo ?? "SEM_CODIGO",
    descricao: row.descricao ?? "Produto sem descrição",
    quantidade: Number(row.quantidade ?? 0),
    total: Number(row.total ?? 0),
  }));
}

export async function getImpostosResumo() {
  const row = await prisma.$queryRaw<{ icms: string | null; pis: string | null; cofins: string | null; ipi: string | null; issqn: string | null; total: string | null }>`
    SELECT
      SUM(icms_valor) AS icms,
      SUM(pis_valor) AS pis,
      SUM(cofins_valor) AS cofins,
      SUM(ipi_valor) AS ipi,
      SUM(issqn_valor) AS issqn,
      SUM(total_tributos) AS total
    FROM impostos_nota;
  `;

  return {
    icms: Number(row?.icms ?? 0),
    pis: Number(row?.pis ?? 0),
    cofins: Number(row?.cofins ?? 0),
    ipi: Number(row?.ipi ?? 0),
    issqn: Number(row?.issqn ?? 0),
    total: Number(row?.total ?? 0),
  };
}

export async function getNotasPaginadas(input: NotasQuery) {
  const page = clampInt(input.page, 1, 10_000);
  const pageSize = clampInt(input.pageSize, 1, 200);

  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (input.tipo_documento) where.tipo_documento = input.tipo_documento;

  if (input.data_ini || input.data_fim) {
    where.data_emissao = {};
    if (input.data_ini) where.data_emissao.gte = new Date(input.data_ini);
    if (input.data_fim) where.data_emissao.lte = new Date(input.data_fim);
  }

  if (input.documento_emitente) {
    where.documento_emitente = input.documento_emitente;
  }

  const [totalCount, items] = await Promise.all([
    prisma.notas_fiscais.count({ where }),
    prisma.notas_fiscais.findMany({
      where,
      orderBy: { data_emissao: "desc" },
      skip,
      take: pageSize,
      select: {
        PK_nota_fiscal_id: true,
        tipo_documento: true,
        chave_acesso: true,
        numero_documento: true,
        data_emissao: true,
        documento_emitente: true,
        nome_emitente: true,
        documento_destinatario: true,
        nome_destinatario: true,
        valor_total: true,
        total_impostos: true,
        xml_bruto_json: true,
        fk_importacao_id: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    data: items,
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}
