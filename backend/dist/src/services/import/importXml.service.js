import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pipeline } from "node:stream/promises";
import sax from "sax";
import { prisma } from "../../db/prisma.js";
import { createAuditLog } from "../audit.service.js";
async function sha256OfFile(filePath) {
    const hash = crypto.createHash("sha256");
    const rs = fs.createReadStream(filePath);
    for await (const chunk of rs)
        hash.update(chunk);
    return hash.digest("hex");
}
const normalizeText = (value) => {
    if (value == null)
        return null;
    const text = String(value).replace(/\s+/g, " ").trim();
    return text.length ? text : null;
};
const normalizeDecimal = (value, precision = 2) => {
    if (value == null)
        return (0).toFixed(precision);
    const normalized = String(value).replace(/\s+/g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed.toFixed(precision) : (0).toFixed(precision);
};
const normalizeQuantity = (value) => {
    if (value == null)
        return "0.0000";
    const normalized = String(value).replace(/\s+/g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed.toFixed(4) : "0.0000";
};
const parseDate = (value) => {
    if (!value)
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
const getAttributeValue = (attributes, name) => {
    if (!attributes)
        return null;
    const key = Object.keys(attributes).find((attrName) => attrName.toLowerCase() === name.toLowerCase());
    if (!key)
        return null;
    return normalizeText(attributes[key]);
};
export async function importXmlService(input) {
    const tmpName = `import-xml-${crypto.randomUUID()}.xml`;
    const tmpPath = path.join(os.tmpdir(), tmpName);
    let importacaoId = null;
    const erroLog = [];
    let totalNotasDetectadas = 0;
    let processed = 0;
    const pendingNotePromises = [];
    try {
        await pipeline(input.stream, fs.createWriteStream(tmpPath));
        const digest = await sha256OfFile(tmpPath);
        const existing = await prisma.importacoes.findUnique({
            where: { hash_arquivo: digest },
            select: {
                PK_importacao_id: true,
                status: true,
                total_registros: true,
                registros_processados: true,
            },
        });
        if (existing) {
            if (existing.status === "CONCLUIDO") {
                return {
                    importacaoId: existing.PK_importacao_id,
                    status: existing.status,
                    totalNotas: existing.total_registros ?? 0,
                    registrosProcessados: existing.registros_processados ?? 0,
                };
            }
            importacaoId = existing.PK_importacao_id;
            await prisma.$transaction([
                prisma.notas_fiscais.deleteMany({ where: { fk_importacao_id: importacaoId } }),
                prisma.importacoes.update({
                    where: { PK_importacao_id: importacaoId },
                    data: {
                        status: "PROCESSANDO",
                        data_hora_inicio: new Date(),
                        data_hora_fim: null,
                        total_registros: 0,
                        registros_processados: 0,
                        log_erros: null,
                    },
                }),
            ]);
        }
        else {
            const importacao = await prisma.importacoes.create({
                data: {
                    PK_importacao_id: crypto.randomUUID(),
                    fk_usuario_id: input.usuarioId,
                    nome_arquivo: input.nomeArquivo,
                    hash_arquivo: digest,
                    tamanho_arquivo_bytes: input.tamanhoBytes ?? BigInt(fs.statSync(tmpPath).size),
                    status: "PROCESSANDO",
                    data_hora_inicio: new Date(),
                },
                select: { PK_importacao_id: true },
            });
            importacaoId = importacao.PK_importacao_id;
        }
        await createAuditLog({
            fk_usuario_id: input.usuarioId,
            acao: "UPLOAD_XML_INICIADO",
            tabela_afetada: "importacoes",
            registro_afetado_id: importacaoId,
            endereco_ip: "unknown",
            agente_usuario: "unknown",
            detalhes: {
                nome_arquivo: input.nomeArquivo,
                hash_arquivo: digest,
            },
        });
        // --- Motor XML (Fase Crítica) ---
        // Root peek: identificar NFE vs NFSE pelo primeiro bloco de abertura (sem depender de infNFe/infNFSe)
        let tipoRoot = null;
        let currentNote = null;
        let currentDet = null;
        let currentService = null;
        let currentText = "";
        let currentTextTag = null;
        let tagStack = [];
        const isEmitContext = (parentTag) => ["emit", "prest", "emitente", "prestador", "remet", "enderemit", "endernac", "ender"].includes(parentTag);
        const isDestContext = (parentTag) => ["dest", "toma", "destinatario", "tomador", "tomaor", "enderdest", "endertoma", "enderdest", "ender"].includes(parentTag);
        const getEmpresaId = async (tx, empresa) => {
            if (!empresa || !empresa.cnpj_cpf)
                return null;
            const identifier = empresa.cnpj_cpf.replace(/[^0-9]/g, "");
            if (!identifier)
                return null;
            const record = await tx.empresas.upsert({
                where: { cnpj_cpf: identifier },
                create: {
                    PK_empresa_id: crypto.randomUUID(),
                    cnpj_cpf: identifier,
                    razao_social: empresa.razao_social || "NOME NÃO INFORMADO",
                    nome_fantasia: empresa.nome_fantasia ?? undefined,
                    endereco: empresa.endereco ?? undefined,
                    cidade: empresa.cidade ?? undefined,
                    uf: empresa.uf ?? undefined,
                    telefone: empresa.telefone ?? undefined,
                    email: empresa.email ?? undefined,
                },
                update: {
                    razao_social: empresa.razao_social || undefined,
                    nome_fantasia: empresa.nome_fantasia ?? undefined,
                    endereco: empresa.endereco ?? undefined,
                    cidade: empresa.cidade ?? undefined,
                    uf: empresa.uf ?? undefined,
                    telefone: empresa.telefone ?? undefined,
                    email: empresa.email ?? undefined,
                },
            });
            return record.PK_empresa_id;
        };
        const upsertProduto = async (tx, item) => {
            if (!item.codigo_produto)
                return null;
            const code = item.codigo_produto.trim();
            if (!code)
                return null;
            const produto = await tx.produtos_cadastrados.upsert({
                where: { codigo: code },
                create: {
                    PK_produto_id: crypto.randomUUID(),
                    codigo: code,
                    descricao: item.descricao || "Produto sem descrição",
                    ncm: item.ncm ?? undefined,
                    cfop: item.cfop ?? undefined,
                    unidade: undefined,
                    preco: normalizeDecimal(item.valor_unitario, 4),
                },
                update: {
                    descricao: item.descricao || undefined,
                    ncm: item.ncm ?? undefined,
                    cfop: item.cfop ?? undefined,
                    preco: normalizeDecimal(item.valor_unitario, 4),
                },
            });
            return produto.PK_produto_id;
        };
        const upsertServico = async (tx, service) => {
            if (!service.codigo_servico)
                return null;
            const code = service.codigo_servico.trim();
            if (!code)
                return null;
            const serv = await tx.servicos_cadastrados.upsert({
                where: { codigo: code },
                create: {
                    PK_servico_id: crypto.randomUUID(),
                    codigo: code,
                    descricao: service.descricao || "Serviço sem descrição",
                    preco: normalizeDecimal(service.valor_servico, 2),
                },
                update: {
                    descricao: service.descricao || undefined,
                    preco: normalizeDecimal(service.valor_servico, 2),
                },
            });
            return serv.PK_servico_id;
        };
        const persistNoteInSingleTx = async (note, tagFechamento) => {
            if (!importacaoId)
                return;
            await prisma.$transaction(async (tx) => {
                if (!note.chave_acesso || note.chave_acesso === null) {
                    throw new Error("Tag estrutural ausente: chave de acesso (chNFe/Id). (" + tagFechamento + ")");
                }
                const emitenteId = await getEmpresaId(tx, note.emitente ?? {
                    cnpj_cpf: note.documento_emitente,
                    razao_social: note.nome_emitente || "EMITENTE NÃO INFORMADO",
                    nome_fantasia: note.nome_emitente,
                });
                const destinatarioId = await getEmpresaId(tx, note.destinatario ?? {
                    cnpj_cpf: note.documento_destinatario,
                    razao_social: note.nome_destinatario || note.nome_emitente || "DESTINATÁRIO NÃO INFORMADO",
                    nome_fantasia: note.nome_destinatario,
                });
                const notaId = crypto.randomUUID();
                await tx.notas_fiscais.create({
                    data: {
                        PK_nota_fiscal_id: notaId,
                        fk_importacao_id: importacaoId,
                        tipo_documento: note.tipo_documento,
                        chave_acesso: note.chave_acesso,
                        numero_documento: note.numero_documento || "",
                        data_emissao: note.data_emissao,
                        documento_emitente: note.documento_emitente || "",
                        nome_emitente: note.nome_emitente || "",
                        documento_destinatario: note.documento_destinatario ?? null,
                        nome_destinatario: note.nome_destinatario ?? null,
                        fk_empresa_emitente_id: emitenteId,
                        fk_empresa_destinatario_id: destinatarioId,
                        valor_total: normalizeDecimal(note.valor_total, 2),
                        total_impostos: normalizeDecimal(note.total_impostos, 2),
                        xml_bruto_json: JSON.stringify(note),
                    },
                });
                if (note.itens.length) {
                    const itens = await Promise.all(note.itens.map(async (item) => ({
                        fk_nota_fiscal_id: notaId,
                        fk_produto_id: await upsertProduto(tx, item),
                        numero_item: item.numero_item,
                        codigo_produto: item.codigo_produto ?? null,
                        descricao: item.descricao,
                        ncm: item.ncm ?? null,
                        cfop: item.cfop ?? null,
                        quantidade: normalizeQuantity(item.quantidade),
                        valor_unitario: normalizeDecimal(item.valor_unitario, 4),
                        valor_total: normalizeDecimal(item.valor_total, 2),
                    })));
                    await tx.itens_nota_fiscal.createMany({ data: itens });
                }
                if (note.servicos.length) {
                    const services = await Promise.all(note.servicos.map(async (service) => ({
                        fk_nota_fiscal_id: notaId,
                        fk_servico_id: await upsertServico(tx, service),
                        codigo_servico: service.codigo_servico ?? null,
                        descricao: service.descricao,
                        valor_servico: normalizeDecimal(service.valor_servico, 2),
                        valor_issqn: normalizeDecimal(service.valor_issqn, 2),
                        deducoes: normalizeDecimal(service.deducoes, 2),
                    })));
                    await tx.servicos_nota_fiscal.createMany({ data: services });
                }
                if (note.duplicatas.length) {
                    const duplicates = note.duplicatas.map((dup) => ({
                        PK_duplicata_id: crypto.randomUUID(),
                        fk_nota_fiscal_id: notaId,
                        numero_duplicata: dup.numero_duplicata || "",
                        data_vencimento: dup.data_vencimento ?? new Date(),
                        valor: normalizeDecimal(dup.valor, 2),
                    }));
                    await tx.duplicatas_financeiras.createMany({ data: duplicates });
                }
                if (note.transporte) {
                    await tx.dados_transporte.create({
                        data: {
                            PK_transporte_id: crypto.randomUUID(),
                            fk_nota_fiscal_id: notaId,
                            modal: note.transporte.modal ?? null,
                            placa: note.transporte.placa ?? null,
                            uf: note.transporte.uf ?? null,
                            nome_transportador: note.transporte.nome_transportador ?? null,
                            cnpj_cpf_transportador: note.transporte.cnpj_cpf_transportador ?? null,
                            cidade_origem: note.transporte.cidade_origem ?? null,
                            cidade_destino: note.transporte.cidade_destino ?? null,
                            valor_frete: normalizeDecimal(note.transporte.valor_frete, 2),
                        },
                    });
                }
                await tx.impostos_nota.create({
                    data: {
                        PK_imposto_id: crypto.randomUUID(),
                        fk_nota_fiscal_id: notaId,
                        icms_base: normalizeDecimal(note.impostos.icms_base, 2),
                        icms_valor: normalizeDecimal(note.impostos.icms_valor, 2),
                        pis_valor: normalizeDecimal(note.impostos.pis_valor, 2),
                        cofins_valor: normalizeDecimal(note.impostos.cofins_valor, 2),
                        ipi_valor: normalizeDecimal(note.impostos.ipi_valor, 2),
                        issqn_valor: normalizeDecimal(note.impostos.issqn_valor, 2),
                        total_tributos: normalizeDecimal(note.impostos.total_tributos, 2),
                    },
                });
            });
            processed++;
        };
        const stream = fs.createReadStream(tmpPath);
        const parser = sax.createStream(true, {
            trim: false,
            normalize: true,
            lowercase: true,
        });
        await new Promise((resolve, reject) => {
            parser.on("opentag", (node) => {
                const rawTag = String(node.name ?? "");
                const tag = rawTag.toLowerCase().split(":").pop() ?? "";
                // Root peek (primeiro tag relevante)
                if (!tipoRoot) {
                    if (tag === "nfe" || tag === "nfeproc" || tag === "nep")
                        tipoRoot = "NFE";
                    else if (tag === "nfse" || tag === "compnfse" || tag === "rps" || tag === "infrps")
                        tipoRoot = "NFSE";
                }
                tagStack.push(tag);
                // Inicializa currentNote apenas quando encontrar o container de nota
                // NFE: infNFe  | NFSE: infNFSe
                if (tipoRoot === "NFE" && (tag === "infnfe" || tag === "nfe")) {
                    const id = getAttributeValue(node.attributes, "id");
                    currentNote = {
                        tipo_documento: "NFE",
                        chave_acesso: id ? id.replace(/^nfe/i, "").trim() : "",
                        numero_documento: "",
                        data_emissao: new Date(),
                        documento_emitente: "",
                        nome_emitente: "",
                        documento_destinatario: null,
                        nome_destinatario: null,
                        valor_total: "0.00",
                        total_impostos: "0.00",
                        itens: [],
                        servicos: [],
                        duplicatas: [],
                        transporte: undefined,
                        impostos: {
                            icms_base: "0.00",
                            icms_valor: "0.00",
                            pis_valor: "0.00",
                            cofins_valor: "0.00",
                            ipi_valor: "0.00",
                            issqn_valor: "0.00",
                            total_tributos: "0.00",
                        },
                    };
                    totalNotasDetectadas++;
                    return;
                }
                if (tipoRoot === "NFSE" && (tag === "infnfse" || tag === "nfse" || tag === "infrps")) {
                    const id = getAttributeValue(node.attributes, "id");
                    currentNote = {
                        tipo_documento: "NFSE",
                        chave_acesso: id ? id.replace(/^(nfs|nfseref|nfse)/i, "").trim() : id ?? "",
                        numero_documento: "",
                        data_emissao: new Date(),
                        documento_emitente: "",
                        nome_emitente: "",
                        documento_destinatario: null,
                        nome_destinatario: null,
                        valor_total: "0.00",
                        total_impostos: "0.00",
                        itens: [],
                        servicos: [],
                        duplicatas: [],
                        transporte: undefined,
                        impostos: {
                            icms_base: "0.00",
                            icms_valor: "0.00",
                            pis_valor: "0.00",
                            cofins_valor: "0.00",
                            ipi_valor: "0.00",
                            issqn_valor: "0.00",
                            total_tributos: "0.00",
                        },
                    };
                    totalNotasDetectadas++;
                    return;
                }
                if (tag === "det" && currentNote?.tipo_documento === "NFE") {
                    currentDet = {
                        numero_item: 0,
                        codigo_produto: null,
                        descricao: "",
                        ncm: null,
                        cfop: null,
                        quantidade: "0",
                        valor_unitario: "0",
                        valor_total: "0",
                    };
                    return;
                }
                if (tag === "det" && currentNote?.tipo_documento === "NFSE") {
                    currentService = {
                        codigo_servico: null,
                        descricao: "",
                        valor_servico: "0.00",
                        valor_issqn: "0.00",
                        deducoes: "0.00",
                    };
                    return;
                }
                if (tag === "serv" && currentNote?.tipo_documento === "NFSE" && !currentService) {
                    currentService = {
                        codigo_servico: null,
                        descricao: "",
                        valor_servico: "0.00",
                        valor_issqn: "0.00",
                        deducoes: "0.00",
                    };
                    return;
                }
                if (tag === "transporta" || tag === "transp" || tag === "veictransp") {
                    if (currentNote && !currentNote.transporte) {
                        currentNote.transporte = {
                            valor_frete: "0.00",
                        };
                    }
                }
                if (tag === "dup") {
                    if (currentNote) {
                        currentNote.duplicatas.push({
                            numero_duplicata: "",
                            data_vencimento: null,
                            valor: "0.00",
                        });
                    }
                }
                currentTextTag = tag;
                currentText = "";
            });
            parser.on("text", (text) => {
                if (!currentTextTag)
                    return;
                currentText += text;
            });
            parser.on("closetag", (name) => {
                const tag = String(name ?? "").toLowerCase().split(":").pop() ?? "";
                tagStack.pop();
                const rawParent = tagStack[tagStack.length - 1] ?? "";
                const parentTag = rawParent.split(":").pop() ?? "";
                const t = normalizeText(currentText);
                if (currentNote) {
                    if (currentNote.tipo_documento === "NFE") {
                        if (t) {
                            if (tag === "chnfe")
                                currentNote.chave_acesso = t;
                            else if (tag === "nnf")
                                currentNote.numero_documento = t;
                            else if (tag === "dhemi" || tag === "demi" || tag === "demi") {
                                const d = parseDate(t);
                                if (d)
                                    currentNote.data_emissao = d;
                            }
                            else if (tag === "cnpj" || tag === "cpf") {
                                if (isEmitContext(parentTag))
                                    currentNote.documento_emitente = t;
                                else if (isDestContext(parentTag))
                                    currentNote.documento_destinatario = t;
                                else if (!currentNote.documento_emitente || currentNote.documento_emitente === "0")
                                    currentNote.documento_emitente = t;
                                else if (!currentNote.documento_destinatario)
                                    currentNote.documento_destinatario = t;
                            }
                            else if (tag === "xnome") {
                                if (isEmitContext(parentTag))
                                    currentNote.nome_emitente = t;
                                else if (isDestContext(parentTag))
                                    currentNote.nome_destinatario = t;
                                else if (!currentNote.nome_emitente)
                                    currentNote.nome_emitente = t;
                                else if (!currentNote.nome_destinatario)
                                    currentNote.nome_destinatario = t;
                            }
                            else if (tag === "vnf" || tag === "vprod")
                                currentNote.valor_total = t;
                            else if (tag === "vtottrib")
                                currentNote.total_impostos = t;
                        }
                        if (currentDet && t) {
                            if (tag === "nitem")
                                currentDet.numero_item = parseInt(t, 10) || 0;
                            else if (tag === "cprod")
                                currentDet.codigo_produto = t;
                            else if (tag === "xprod")
                                currentDet.descricao = t;
                            else if (tag === "ncm")
                                currentDet.ncm = t;
                            else if (tag === "cfop")
                                currentDet.cfop = t;
                            else if (tag === "qcom")
                                currentDet.quantidade = t;
                            else if (tag === "vuncom")
                                currentDet.valor_unitario = t;
                            else if (tag === "vprod")
                                currentDet.valor_total = t;
                        }
                    }
                    else {
                        if (t) {
                            if (tag === "id")
                                currentNote.chave_acesso = t.replace(/^(nfs|nfseref)/i, "").trim();
                            else if (tag === "nnfse" || tag === "ndfse" || tag === "ndps")
                                currentNote.numero_documento = t;
                            else if (tag === "dhemi" || tag === "demi" || tag === "dhemipt") {
                                const d = parseDate(t);
                                if (d)
                                    currentNote.data_emissao = d;
                            }
                            else if (tag === "cnpj" || tag === "cpf") {
                                if (isEmitContext(parentTag))
                                    currentNote.documento_emitente = t;
                                else if (isDestContext(parentTag))
                                    currentNote.documento_destinatario = t;
                                else if (!currentNote.documento_emitente || currentNote.documento_emitente === "0")
                                    currentNote.documento_emitente = t;
                                else if (!currentNote.documento_destinatario)
                                    currentNote.documento_destinatario = t;
                            }
                            else if (tag === "xnome" || tag === "xnomeprinc") {
                                if (isEmitContext(parentTag))
                                    currentNote.nome_emitente = t;
                                else if (isDestContext(parentTag))
                                    currentNote.nome_destinatario = t;
                                else if (!currentNote.nome_emitente)
                                    currentNote.nome_emitente = t;
                                else if (!currentNote.nome_destinatario)
                                    currentNote.nome_destinatario = t;
                            }
                            else if (tag === "vservprest" || tag === "vserv" || tag === "vtotal" || tag === "vnf" || tag === "vliq")
                                currentNote.valor_total = t;
                            else if (tag === "vtottrib" || tag === "vissqn")
                                currentNote.total_impostos = t;
                        }
                        if (currentService && t) {
                            if (tag === "cservico" || tag === "codservico" || tag === "ctribnac")
                                currentService.codigo_servico = t;
                            else if (tag === "xservico" || tag === "xdescserv" || tag === "xdescservico") {
                                if (!currentService.descricao || currentService.descricao === "")
                                    currentService.descricao = t;
                            }
                            else if (tag === "vservprest" || tag === "vserv")
                                currentService.valor_servico = t;
                            else if (tag === "vissqn" || tag === "viss")
                                currentService.valor_issqn = t;
                            else if (tag === "vdeducao" || tag === "vded" || tag === "vdr")
                                currentService.deducoes = t;
                        }
                    }
                    if (currentNote.transporte && t) {
                        if (tag === "modal" || tag === "modfrete")
                            currentNote.transporte.modal = t;
                        else if (tag === "placa")
                            currentNote.transporte.placa = t;
                        else if (tag === "uf")
                            currentNote.transporte.uf = t;
                        else if (tag === "xnome")
                            currentNote.transporte.nome_transportador = t;
                        else if (tag === "cnpj" || tag === "cpf")
                            currentNote.transporte.cnpj_cpf_transportador = t;
                        else if (tag === "xmun" || tag === "cidadeorigem")
                            currentNote.transporte.cidade_origem = t;
                        else if (tag === "cmun" || tag === "cidadedestino")
                            currentNote.transporte.cidade_destino = t;
                        else if (tag === "vfrete")
                            currentNote.transporte.valor_frete = t;
                    }
                    if (currentNote.duplicatas.length && t) {
                        const dup = currentNote.duplicatas[currentNote.duplicatas.length - 1];
                        if (tag === "ndup" || tag === "numeroduplicata")
                            dup.numero_duplicata = t;
                        else if (tag === "dvenc" || tag === "datavencimento") {
                            const d = parseDate(t);
                            if (d)
                                dup.data_vencimento = d;
                        }
                        else if (tag === "vdup" || tag === "valordup" || tag === "valor")
                            dup.valor = t;
                    }
                    if (t) {
                        if (tag === "vbc" && parentTag === "icmstot")
                            currentNote.impostos.icms_base = t;
                        else if (tag === "vicms")
                            currentNote.impostos.icms_valor = t;
                        else if (tag === "vpis")
                            currentNote.impostos.pis_valor = t;
                        else if (tag === "vcofins")
                            currentNote.impostos.cofins_valor = t;
                        else if (tag === "vipi")
                            currentNote.impostos.ipi_valor = t;
                        else if (tag === "vissqn")
                            currentNote.impostos.issqn_valor = t;
                        else if (tag === "vtottrib" || tag === "totaltributos")
                            currentNote.impostos.total_tributos = t;
                    }
                }
                if (tag === "det" && currentNote?.tipo_documento === "NFE" && currentDet) {
                    if (!currentDet.descricao)
                        currentDet.descricao = "";
                    currentNote.itens.push(currentDet);
                    currentDet = null;
                    currentText = "";
                    currentTextTag = null;
                    return;
                }
                if (tag === "det" && currentNote?.tipo_documento === "NFSE" && currentService) {
                    if (!currentService.descricao)
                        currentService.descricao = "";
                    currentNote.servicos.push(currentService);
                    currentService = null;
                    currentText = "";
                    currentTextTag = null;
                    return;
                }
                if (tag === "serv" && currentNote?.tipo_documento === "NFSE" && currentService) {
                    if (!currentService.descricao)
                        currentService.descricao = "";
                    currentNote.servicos.push(currentService);
                    currentService = null;
                    currentText = "";
                    currentTextTag = null;
                    return;
                }
                // Fechamento da tag raiz da nota (interpretado como infNFe/infNFSe)
                // Persistência em 1 única transaction (por nota)
                if ((tag === "infnfe" || tag === "nfe") && currentNote?.tipo_documento === "NFE") {
                    const snapshot = JSON.parse(JSON.stringify(currentNote));
                    currentNote = null;
                    currentText = "";
                    currentTextTag = null;
                    pendingNotePromises.push(persistNoteInSingleTx(snapshot, tag).catch((e) => {
                        erroLog.push({ erro: e?.message ?? "Falha ao persistir nota (infnfe/nfe)", tag, linha: null });
                    }));
                    return;
                }
                if ((tag === "infnfse" || tag === "infrps" || tag === "nfse") &&
                    currentNote?.tipo_documento === "NFSE") {
                    const snapshot = JSON.parse(JSON.stringify(currentNote));
                    currentNote = null;
                    currentText = "";
                    currentTextTag = null;
                    pendingNotePromises.push(persistNoteInSingleTx(snapshot, tag).catch((e) => {
                        erroLog.push({ erro: e?.message ?? "Falha ao persistir nota (NFSe)", tag, linha: null });
                    }));
                    return;
                }
                currentText = "";
                currentTextTag = null;
            });
            parser.on("error", (err) => reject(err));
            parser.on("end", async () => {
                try {
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
            stream.pipe(parser);
        });
        await Promise.all(pendingNotePromises);
        const statusFinal = erroLog.length === 0 && processed === totalNotasDetectadas
            ? "CONCLUIDO"
            : processed > 0
                ? "PARCIAL"
                : "FALHOU";
        await prisma.importacoes.update({
            where: { PK_importacao_id: importacaoId },
            data: {
                status: statusFinal,
                data_hora_fim: new Date(),
                total_registros: totalNotasDetectadas,
                registros_processados: processed,
                log_erros: erroLog.length ? JSON.stringify(erroLog) : undefined,
            },
        });
        await createAuditLog({
            fk_usuario_id: input.usuarioId,
            acao: statusFinal === "CONCLUIDO"
                ? "UPLOAD_XML_CONCLUIDO"
                : statusFinal === "PARCIAL"
                    ? "UPLOAD_XML_PARCIAL"
                    : "UPLOAD_XML_FALHOU",
            tabela_afetada: "importacoes",
            registro_afetado_id: importacaoId,
            endereco_ip: "unknown",
            agente_usuario: "unknown",
            detalhes: {
                totalNotasDetectadas,
                processed,
                statusFinal,
                errors: erroLog,
            },
        });
        return {
            importacaoId: importacaoId,
            status: statusFinal,
            totalNotas: totalNotasDetectadas,
            registrosProcessados: processed,
        };
    }
    catch (err) {
        if (importacaoId) {
            const cleanupErrors = [
                {
                    erro: err?.message ?? "Falha estrutural no XML",
                    tag: null,
                    linha: null,
                },
            ];
            await prisma.$transaction([
                prisma.notas_fiscais.deleteMany({ where: { fk_importacao_id: importacaoId } }),
                prisma.importacoes.update({
                    where: { PK_importacao_id: importacaoId },
                    data: {
                        status: "FALHOU",
                        data_hora_fim: new Date(),
                        log_erros: JSON.stringify(cleanupErrors),
                    },
                }),
            ]);
            await createAuditLog({
                fk_usuario_id: input.usuarioId,
                acao: "UPLOAD_XML_FALHOU",
                tabela_afetada: "importacoes",
                registro_afetado_id: importacaoId,
                endereco_ip: "unknown",
                agente_usuario: "unknown",
                detalhes: {
                    error: err?.message,
                    cleanupErrors,
                },
            });
        }
        throw new Error(err?.message ?? "Falha estrutural no XML");
    }
    finally {
        try {
            fs.rmSync(tmpPath, { force: true });
        }
        catch {
            // ignore
        }
    }
}
