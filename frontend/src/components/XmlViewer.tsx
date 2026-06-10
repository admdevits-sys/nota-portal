import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, FileText, Copy, Download, ChevronDown, ChevronRight, Tag, Hash, Calendar, Building2, DollarSign, Package, Truck, RefreshCw } from "lucide-react";
import { Badge } from "./ui/badge";
import { GlassCard } from "./ui/glass-card";
import { api } from "../services/api";

interface ItemNota {
  PK_item_id: string;
  numero_item: number;
  codigo_produto: string | null;
  descricao: string;
  ncm: string | null;
  cfop: string | null;
  quantidade: string | number;
  valor_unitario: string | number;
  valor_total: string | number;
}

interface ServicoNota {
  PK_servico_id: string;
  codigo_servico: string | null;
  descricao: string;
  valor_servico: string | number;
  valor_issqn: string | number;
  deducoes: string | number;
}

interface ImpostoNota {
  PK_imposto_id: string;
  icms_base: string | number;
  icms_valor: string | number;
  pis_valor: string | number;
  cofins_valor: string | number;
  ipi_valor: string | number;
  issqn_valor: string | number;
  total_tributos: string | number;
}

interface NotaDetalhada {
  PK_nota_fiscal_id: string;
  tipo_documento: string;
  chave_acesso: string;
  numero_documento: string;
  data_emissao: string;
  documento_emitente: string;
  nome_emitente: string;
  documento_destinatario?: string | null;
  nome_destinatario?: string | null;
  valor_total: string | number;
  total_impostos: string | number;
  xml_bruto_json?: string | null;
  itens_nota_fiscal?: ItemNota[];
  servicos_nota_fiscal?: ServicoNota[];
  impostos_nota?: ImpostoNota[];
}

interface XmlViewerProps {
  isOpen: boolean;
  onClose: () => void;
  nota: {
    PK_nota_fiscal_id: string;
    tipo_documento: string;
    chave_acesso: string;
    numero_documento: string;
    data_emissao: string;
    documento_emitente: string;
    nome_emitente: string;
    documento_destinatario?: string | null;
    nome_destinatario?: string | null;
    valor_total: string | number;
    total_impostos: string | number;
    xml_bruto_json?: string | null;
  } | null;
}

interface XmlField {
  category: string;
  icon: React.ReactNode;
  fields: { label: string; value: string; type?: "text" | "money" | "date" | "code" | "document" }[];
}

function formatBRL(value: number | string | undefined | null) {
  if (value == null || value === "") return "—";
  const normalized = typeof value === "string" ? value.replace(/,/g, ".") : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function XmlViewer({ isOpen, onClose, nota }: XmlViewerProps) {
  const [activeTab, setActiveTab] = useState<"dados" | "produtos" | "impostos" | "xml">("dados");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const { data: notaDetalhada, isLoading } = useQuery<NotaDetalhada>({
    queryKey: ["nota", nota?.PK_nota_fiscal_id],
    queryFn: async () => {
      const res = await api.get<NotaDetalhada>(`/import/notas/${nota!.PK_nota_fiscal_id}`);
      return res.data;
    },
    enabled: !!nota?.PK_nota_fiscal_id,
  });

  if (!isOpen || !nota) return null;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const copyXmlToClipboard = () => {
    if (nota.xml_bruto_json) {
      navigator.clipboard.writeText(nota.xml_bruto_json);
    }
  };

  const downloadXml = () => {
    if (nota.xml_bruto_json) {
      const blob = new Blob([nota.xml_bruto_json], { type: "text/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nota_${nota.chave_acesso || nota.numero_documento}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Parse XML content if available
  const parseXmlFields = (): XmlField[] => {
    if (!nota.xml_bruto_json) return [];

    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(nota.xml_bruto_json, "text/xml");
      const root = xml.documentElement;

      // Common NF-e/NFSe fields
      const fields: XmlField[] = [];

      // Header Info
      fields.push({
        category: "Identificação",
        icon: <FileText className="h-4 w-4" />,
        fields: [
          { label: "Chave de Acesso", value: nota.chave_acesso, type: "code" },
          { label: "Número", value: nota.numero_documento, type: "code" },
          { label: "Data de Emissão", value: formatDate(nota.data_emissao), type: "date" },
          { label: "Tipo", value: nota.tipo_documento, type: "text" },
        ],
      });

      // Emitente
      fields.push({
        category: "Emitente",
        icon: <Building2 className="h-4 w-4" />,
        fields: [
          { label: "CNPJ/CPF", value: nota.documento_emitente, type: "document" },
          { label: "Nome/Razão Social", value: nota.nome_emitente, type: "text" },
        ],
      });

      // Destinatário
      if (nota.documento_destinatario) {
        fields.push({
          category: "Destinatário",
          icon: <Truck className="h-4 w-4" />,
          fields: [
            { label: "CNPJ/CPF", value: nota.documento_destinatario, type: "document" },
            { label: "Nome/Razão Social", value: nota.nome_destinatario || "—", type: "text" },
          ],
        });
      }

      // Valores
      fields.push({
        category: "Valores",
        icon: <DollarSign className="h-4 w-4" />,
        fields: [
          { label: "Valor Total", value: formatBRL(nota.valor_total), type: "money" },
          { label: "Total de Impostos", value: formatBRL(nota.total_impostos), type: "money" },
        ],
      });

      // Campos específicos NFSe
      const infNfse = root.getElementsByTagName("infNFSe")[0] || root.getElementsByTagName("InfNFSe")[0];
      if (infNfse && nota.tipo_documento === "NFSE") {
        const valores = infNfse.getElementsByTagName("valores")[0] || infNfse.getElementsByTagName("Valores")[0];
        const dps = root.getElementsByTagName("infDPS")[0] || root.getElementsByTagName("InfDPS")[0];
        const trib = dps?.getElementsByTagName("trib")[0] || dps?.getElementsByTagName("Trib")[0];
        const tribMun = trib?.getElementsByTagName("tribMun")[0] || trib?.getElementsByTagName("TribMun")[0];
        const totTrib = trib?.getElementsByTagName("totTrib")[0] || trib?.getElementsByTagName("TotTrib")[0];

        const nfseFields: { label: string; value: string; type?: "text" | "money" | "date" | "code" | "document" }[] = [];

        // Verificação e Versão
        const verAplic = root.getElementsByTagName("verAplic")[0]?.textContent || root.getElementsByTagName("VerAplic")[0]?.textContent;
        if (verAplic) nfseFields.push({ label: "Versão da Aplicação", value: verAplic, type: "text" });

        const ambGer = root.getElementsByTagName("ambGer")[0]?.textContent || root.getElementsByTagName("AmbGer")[0]?.textContent;
        if (ambGer) nfseFields.push({ label: "Ambiente Gerador", value: ambGer === "1" ? "Produção" : "Homologação", type: "text" });

        const cStat = root.getElementsByTagName("cStat")[0]?.textContent;
        if (cStat) nfseFields.push({ label: "Situação da NFS-e", value: cStat, type: "text" });

        // Valores do serviço
        if (valores) {
          const vServPrest = valores.getElementsByTagName("vServPrest")[0]?.textContent || valores.getElementsByTagName("VServPrest")[0]?.textContent;
          if (vServPrest) nfseFields.push({ label: "Valor Serv Prestado", value: formatBRL(vServPrest), type: "money" });

          const vLiq = valores.getElementsByTagName("vLiq")[0]?.textContent || valores.getElementsByTagName("VLiq")[0]?.textContent;
          if (vLiq) nfseFields.push({ label: "Valor Líquido", value: formatBRL(vLiq), type: "money" });
        }

        // Campos de tributação
        if (tribMun) {
          const tribISSQN = tribMun.getElementsByTagName("tribISSQN")[0]?.textContent || tribMun.getElementsByTagName("TribISSQN")[0]?.textContent;
          if (tribISSQN) nfseFields.push({ label: "Tributação ISSQN", value: tribISSQN, type: "text" });

          const tpRetISSQN = tribMun.getElementsByTagName("tpRetISSQN")[0]?.textContent || tribMun.getElementsByTagName("TpRetISSQN")[0]?.textContent;
          if (tpRetISSQN) nfseFields.push({ label: "Tipo Retenção ISSQN", value: tpRetISSQN, type: "text" });
        }

        if (totTrib) {
          const indTotTrib = totTrib.getElementsByTagName("indTotTrib")[0]?.textContent || totTrib.getElementsByTagName("IndTotTrib")[0]?.textContent;
          if (indTotTrib) nfseFields.push({ label: "Indicador Total Tributos", value: indTotTrib, type: "text" });
        }

        if (nfseFields.length > 0) {
          fields.push({
            category: "NFSe Detalhes",
            icon: <FileText className="h-4 w-4" />,
            fields: nfseFields,
          });
        }

        // Seção de Tributação Municipal (da DPS) - usando tribMun já declarado acima
        if (tribMun) {
          const tribMunFields: { label: string; value: string; type?: "text" | "money" | "date" | "code" | "document" }[] = [];

          const tribISSQN = tribMun.getElementsByTagName("tribISSQN")[0]?.textContent || tribMun.getElementsByTagName("TribISSQN")[0]?.textContent;
          if (tribISSQN) tribMunFields.push({ label: "Tributação ISSQN", value: tribISSQN === "1" ? "Não Tributável" : tribISSQN === "2" ? "Tributável" : tribISSQN, type: "text" });

          const tpRetISSQN = tribMun.getElementsByTagName("tpRetISSQN")[0]?.textContent || tribMun.getElementsByTagName("TpRetISSQN")[0]?.textContent;
          if (tpRetISSQN) tribMunFields.push({ label: "Tipo Retenção ISSQN", value: tpRetISSQN, type: "text" });

          if (tribMunFields.length > 0) {
            fields.push({
              category: "Tributação Municipal",
              icon: <Tag className="h-4 w-4" />,
              fields: tribMunFields,
            });
          }
        }

        // Seção de PIS/COFINS (se disponível)
        const pisCofins = root.getElementsByTagName("pisCofins")[0] || root.getElementsByTagName("PisCofins")[0] || root.getElementsByTagName("pis")[0] || root.getElementsByTagName("PIS")[0];
        if (pisCofins || root.getElementsByTagName("vPIS")[0] || root.getElementsByTagName("vCOFINS")[0]) {
          const pisFields: { label: string; value: string; type?: "text" | "money" | "date" | "code" | "document" }[] = [];

          const vPIS = root.getElementsByTagName("vPIS")[0]?.textContent || root.getElementsByTagName("VPIS")[0]?.textContent;
          if (vPIS) pisFields.push({ label: "PIS - Valor", value: formatBRL(vPIS), type: "money" });

          const vCOFINS = root.getElementsByTagName("vCOFINS")[0]?.textContent || root.getElementsByTagName("VCOFINS")[0]?.textContent;
          if (vCOFINS) pisFields.push({ label: "COFINS - Valor", value: formatBRL(vCOFINS), type: "money" });

          if (pisFields.length > 0) {
            fields.push({
              category: "PIS/COFINS",
              icon: <Tag className="h-4 w-4" />,
              fields: pisFields,
            });
          }
        }

        // Seção de Retenções (IRRF, CSLL, etc)
        const irpf = root.getElementsByTagName("irrf")[0] || root.getElementsByTagName("IRRF")[0];
        const csll = root.getElementsByTagName("vCSLL")[0] || root.getElementsByTagName("VCSLL")[0];
        const cpp = root.getElementsByTagName("vCPP")[0] || root.getElementsByTagName("VCPP")[0];
        if (irpf || csll || cpp) {
          const retencoesFields: { label: string; value: string; type?: "text" | "money" | "date" | "code" | "document" }[] = [];

          const vIRRF = root.getElementsByTagName("vIRRF")[0]?.textContent || root.getElementsByTagName("VIRRF")[0]?.textContent;
          if (vIRRF) retencoesFields.push({ label: "IRRF - Valor Retido", value: formatBRL(vIRRF), type: "money" });

          if (csll) retencoesFields.push({ label: "CSLL - Valor Retido", value: formatBRL(csll.textContent || "0"), type: "money" });

          if (cpp) retencoesFields.push({ label: "CPP - Valor Retido", value: formatBRL(cpp.textContent || "0"), type: "money" });

          if (retencoesFields.length > 0) {
            fields.push({
              category: "Retenções Federais",
              icon: <Tag className="h-4 w-4" />,
              fields: retencoesFields,
            });
          }
        }
      }

      // Try to extract more fields from XML
      const infNFe = root.getElementsByTagName("infNFe")[0] || root.getElementsByTagName("InfNFe")[0];
      if (infNFe) {
        const ide = infNFe.getElementsByTagName("ide")[0];
        if (ide) {
          const nfeData = fields.find((f) => f.category === "Identificação");
          if (nfeData) {
            const serie = ide.getElementsByTagName("serie")[0]?.textContent;
            if (serie) nfeData.fields.push({ label: "Série", value: serie, type: "code" });
          }
        }
      }

      return fields;
    } catch {
      return [];
    }
  };

  const xmlFields = parseXmlFields();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/50 bg-brandGreen-light px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Visualização do XML</p>
              <h2 className="text-xl font-bold text-white">
                {nota.tipo_documento === "NFE" ? "NF-e" : "NFSe"} - {nota.numero_documento}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={nota.tipo_documento === "NFE" ? "nfe" : "nfse"} size="lg">
              {nota.tipo_documento === "NFE" ? "NF-e" : "NFSe"}
            </Badge>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white transition-all hover:bg-white/30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200/50 bg-slate-50/50 dark:bg-slate-800/50">
          {["dados", "produtos", "impostos", "xml"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "border-b-2 border-brandGreen-600 text-brandGreen-600 dark:text-brandGreen-400 bg-white dark:bg-slate-900"
                  : "text-slate-600 hover:bg-white/80 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {tab === "dados" ? "Dados Gerais" : tab === "produtos" ? "Produtos/Serviços" : tab === "impostos" ? "Impostos" : "XML Original"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-160px)]">
          {activeTab === "dados" && (
            <div className="space-y-4">
              {xmlFields.map((section) => (
                <GlassCard key={section.category} className="p-0 overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.category)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-100 text-brandGreen-600 dark:bg-brandGreen-500/20 dark:text-brandGreen-400">
                        {section.icon}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{section.category}</span>
                    </div>
                    {expandedSections[section.category] ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                  {expandedSections[section.category] !== false && (
                    <div className="border-t border-slate-100 dark:border-slate-700/50">
                      <table className="w-full">
                        <tbody>
                          {section.fields.map((field, index) => (
                            <tr
                              key={field.label}
                              className={`${index !== section.fields.length - 1 ? "border-b border-slate-100 dark:border-slate-700/30" : ""}`}
                            >
                              <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 w-1/3">
                                {field.label}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-sm font-semibold ${
                                    field.type === "money"
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : field.type === "code" || field.type === "document"
                                      ? "font-mono text-slate-700 dark:text-slate-300"
                                      : "text-slate-900 dark:text-white"
                                  }`}
                                >
                                  {field.value}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </GlassCard>
              ))}

              {/* Default expand all sections if none expanded */}
              {Object.keys(expandedSections).length === 0 &&
                xmlFields.map((section) => (
                  <GlassCard key={section.category} className="p-0 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-100 text-brandGreen-600 dark:bg-brandGreen-500/20 dark:text-brandGreen-400">
                          {section.icon}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{section.category}</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {section.fields.map((field) => (
                          <div
                            key={field.label}
                            className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
                          >
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{field.label}</p>
                            <p
                              className={`text-sm font-semibold ${
                                field.type === "money"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : field.type === "code" || field.type === "document"
                                  ? "font-mono text-slate-700 dark:text-slate-300"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                ))}
            </div>
          )}

          {activeTab === "produtos" && (
            <div className="space-y-4">
              {isLoading ? (
                <GlassCard>
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-brandGreen-500" />
                  </div>
                </GlassCard>
              ) : notaDetalhada?.tipo_documento === "NFE" && notaDetalhada?.itens_nota_fiscal?.length ? (
                notaDetalhada.itens_nota_fiscal.map((item) => (
                  <GlassCard key={item.PK_item_id}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-100 text-brandGreen-600">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">Item {item.numero_item}</h4>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatBRL(item.valor_total)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{item.descricao}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                            <p className="text-slate-500">Código</p>
                            <p className="font-mono font-semibold">{item.codigo_produto || "—"}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                            <p className="text-slate-500">NCM</p>
                            <p className="font-mono font-semibold">{item.ncm || "—"}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                            <p className="text-slate-500">Quantidade</p>
                            <p className="font-semibold">{item.quantidade}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                            <p className="text-slate-500">Valor Unit.</p>
                            <p className="font-semibold">{formatBRL(item.valor_unitario)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : notaDetalhada?.tipo_documento === "NFSE" && notaDetalhada?.servicos_nota_fiscal?.length ? (
                notaDetalhada.servicos_nota_fiscal.map((servico) => (
                  <GlassCard key={servico.PK_servico_id}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandRed-100 text-brandRed-600">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">Serviço</h4>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatBRL(servico.valor_servico)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{servico.descricao}</p>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                            <p className="text-slate-500">Código</p>
                            <p className="font-mono font-semibold">{servico.codigo_servico || "—"}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                            <p className="text-slate-500">ISSQN</p>
                            <p className="font-semibold">{formatBRL(servico.valor_issqn)}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                            <p className="text-slate-500">Deduções</p>
                            <p className="font-semibold">{formatBRL(servico.deducoes)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <GlassCard>
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-semibold">Nenhum item encontrado</p>
                    <p className="text-sm text-slate-400 mt-1">Esta nota não possui produtos ou serviços registrados</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === "impostos" && (
            <div className="space-y-4">
              {isLoading ? (
                <GlassCard>
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-brandGreen-500" />
                  </div>
                </GlassCard>
              ) : notaDetalhada?.impostos_nota?.length ? (
                notaDetalhada.impostos_nota.map((imposto) => (
                  <GlassCard key={imposto.PK_imposto_id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Resumo de Impostos</h4>
                        <p className="text-sm text-slate-500">Total: {formatBRL(imposto.total_tributos)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-slate-500 mb-1">ICMS Base</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBRL(imposto.icms_base)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-slate-500 mb-1">ICMS Valor</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBRL(imposto.icms_valor)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-slate-500 mb-1">PIS</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBRL(imposto.pis_valor)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-slate-500 mb-1">COFINS</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBRL(imposto.cofins_valor)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-slate-500 mb-1">IPI</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBRL(imposto.ipi_valor)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-slate-500 mb-1">ISSQN</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBRL(imposto.issqn_valor)}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <GlassCard>
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-semibold">Nenhum imposto encontrado</p>
                    <p className="text-sm text-slate-400 mt-1">Esta nota não possui registros de impostos</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === "xml" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="info">XML Original</Badge>
                <div className="flex gap-2">
                  <button
                    onClick={copyXmlToClipboard}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Copy className="h-4 w-4" /> Copiar
                  </button>
                  <button
                    onClick={downloadXml}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download className="h-4 w-4" /> Baixar
                  </button>
                </div>
              </div>
              <GlassCard className="p-0 overflow-hidden">
                <pre className="overflow-x-auto p-4 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-950 text-slate-100 rounded-2xl">
                  {nota.xml_bruto_json || "<xml não disponível>"}
                </pre>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}