import * as Progress from "@radix-ui/react-progress";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";
import { DocumentIcon } from "../components/ui/document-icon";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Key,
  Building2,
  Receipt,
  Copy,
  RefreshCw,
  Globe,
  Search,
  Stamp,
  Filter,
} from "lucide-react";

type ValidationStatus = "VALIDO" | "INVALIDO" | "ERRO_CONSULTA";

interface ValidationError {
  codigo: string;
  mensagem: string;
  campo?: string;
  severidade: "ERRO" | "ALERTA" | "INFO";
}

interface NotaFiscal {
  PK_nota_fiscal_id: string;
  tipo_documento: "NFE" | "NFSE";
  chave_acesso: string;
  numero_documento: string;
  data_emissao: string;
  documento_emitente: string;
  nome_emitente: string;
  documento_destinatario?: string;
  nome_destinatario?: string;
  valor_total: string;
  fk_importacao_id: string;
}

interface ValidationResult {
  validacaoId: string;
  status: ValidationStatus;
  tipoDocumento: "NFE" | "NFSE";
  chaveAcesso: string;
  numeroDocumento: string;
  cnpjEmitente: string;
  nomeEmitente: string;
  cnpjDestinatario?: string;
  nomeDestinatario?: string;
  valorTotal: string;
  dataEmissao: string;
  situacaoFiscal: string;
  protocolo?: string;
  dataAutorizacao?: string;
  erros: ValidationError[];
}

export function ValidationPage() {
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [searchChave, setSearchChave] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Query para buscar notas via dashboard/notas
  const { data: notasData, isLoading, refetch: refetchNotas } = useQuery({
    queryKey: ["dashboard", "notas", "all"],
    queryFn: async () => {
      const response = await api.get<{ data: NotaFiscal[] }>("/dashboard/notas?pageSize=100");
      return response.data;
    },
  });

  // Query para histórico
  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ["validation", "history"],
    queryFn: async () => {
      const response = await api.get<{
        data: any[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>("/validation?limit=10");
      return response.data;
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (nota: NotaFiscal) => {
      const response = await api.post<ValidationResult>("/validation/validar", {
        chaveAcesso: nota.chave_acesso,
        tipoDocumento: nota.tipo_documento,
      });
      return response.data;
    },
    onMutate: () => {
      setIsValidating(true);
      setValidationResult(null);
    },
    onSuccess: (data) => {
      setValidationResult(data);
      setIsValidating(false);
      refetchHistory();
    },
    onError: (err: any) => {
      setIsValidating(false);
      alert(err?.response?.data?.message || err?.message || "Erro ao validar.");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const notasFiltradas = notasData?.data.filter(nota =>
    nota.chave_acesso.toLowerCase().includes(searchChave.toLowerCase()) ||
    nota.nome_emitente.toLowerCase().includes(searchChave.toLowerCase()) ||
    nota.numero_documento.includes(searchChave)
  ) ?? [];

  const statusIcon = {
    VALIDO: <CheckCircle className="h-16 w-16 text-emerald-500" />,
    INVALIDO: <XCircle className="h-16 w-16 text-rose-500" />,
    ERRO_CONSULTA: <AlertTriangle className="h-16 w-16 text-amber-500" />,
  };

  const statusColor = {
    VALIDO: "border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-500/10",
    INVALIDO: "border-rose-200 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-500/10",
    ERRO_CONSULTA: "border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-500/10",
  };

  const statusTitle = {
    VALIDO: "Documento Válido!",
    INVALIDO: "Documento Rejeitado",
    ERRO_CONSULTA: "Erro na Consulta",
  };

  const situacaoBadgeVariant = (situacao: string) => {
    if (situacao === "AUTENTICA" || situacao === "REGULAR") return "success";
    if (situacao === "HOMOLOGACAO") return "warning";
    return "error";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Validação de XML
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                APIs oficiais ADN / Sistema Nacional NFS-e
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Esquerda: Lista de Notas */}
        <div className="space-y-4">
          <GlassCard>
            <div className="mb-4 flex items-center gap-3">
              <Filter className="h-5 w-5 text-slate-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Notas Fiscais</h3>
            </div>

            {/* Busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por chave, emitente ou número..."
                value={searchChave}
                onChange={(e) => setSearchChave(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-emerald-500"
              />
            </div>

            {/* Lista de Notas */}
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : notasFiltradas.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  {searchChave ? "Nenhuma nota encontrada." : "Nenhuma nota importada."}
                </div>
              ) : (
                notasFiltradas.map((nota) => (
                  <div
                    key={nota.PK_nota_fiscal_id}
                    onClick={() => {
                      setSelectedNota(nota);
                      setValidationResult(null);
                    }}
                    className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all ${
                      selectedNota?.PK_nota_fiscal_id === nota.PK_nota_fiscal_id
                        ? "bg-emerald-50 border-2 border-emerald-500 dark:bg-emerald-500/20"
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-2 border-transparent"
                    }`}
                  >
                    <DocumentIcon type={nota.tipo_documento === "NFE" ? "nfe" : "nfse"} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={nota.tipo_documento === "NFE" ? "nfe" : "nfse"} className="text-xs">
                          {nota.tipo_documento}
                        </Badge>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {nota.nome_emitente}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate mt-1">
                        {nota.chave_acesso}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {parseFloat(nota.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(nota.data_emissao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Direita: Validação */}
        <div className="space-y-4">
          {selectedNota && !validationResult ? (
            <GlassCard>
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Nota Selecionada</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-100 dark:bg-brandGreen-500/20">
                    <Key className="h-5 w-5 text-brandGreen-600 dark:text-brandGreen-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Chave de Acesso</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 font-mono text-sm text-slate-700 dark:text-slate-300 truncate">
                        {selectedNota.chave_acesso}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedNota.chave_acesso)}
                        className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Copy className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Tipo</p>
                    <Badge variant={selectedNota.tipo_documento === "NFE" ? "nfe" : "nfse"} className="mt-1">
                      {selectedNota.tipo_documento}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Número</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                      {selectedNota.numero_documento}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Emitente</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                    {selectedNota.nome_emitente}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">{selectedNota.documento_emitente}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Valor Total</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {parseFloat(selectedNota.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>

                <button
                  onClick={() => validateMutation.mutate(selectedNota)}
                  disabled={isValidating}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold transition-all ${
                    isValidating
                      ? "cursor-not-allowed bg-slate-100 text-slate-400"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/30 hover:scale-105 hover:shadow-2xl"
                  }`}
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Validando no ADN...
                    </>
                  ) : (
                    <>
                      <Globe className="h-5 w-5" />
                      Validar no ADN / SEFAZ
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          ) : validationResult ? (
            <div className="space-y-4">
              {/* Resultado */}
              <GlassCard className={statusColor[validationResult.status]}>
                <div className="flex flex-col items-center gap-6 text-center">
                  {statusIcon[validationResult.status]}
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {statusTitle[validationResult.status]}
                    </h3>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                      {validationResult.status === "VALIDO"
                        ? "Documento autenticado junto ao Ambiente de Dados Nacional."
                        : "Documento rejeitado pela API oficial."}
                    </p>
                  </div>
                  <Badge variant={situacaoBadgeVariant(validationResult.situacaoFiscal)} className="text-sm px-4 py-1">
                    Situação: {validationResult.situacaoFiscal}
                  </Badge>
                  {validationResult.protocolo && (
                    <div className="flex items-center gap-2">
                      <Stamp className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Protocolo: {validationResult.protocolo}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setValidationResult(null);
                      setSelectedNota(null);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Selecionar Outra Nota
                  </button>
                </div>
              </GlassCard>

              {/* Detalhes */}
              <GlassCard>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Detalhes do Documento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Chave</p>
                    <code className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {validationResult.chaveAcesso.substring(0, 20)}...
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Emitente</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{validationResult.nomeEmitente}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Valor</p>
                    <p className="text-sm font-bold text-emerald-600">
                      {parseFloat(validationResult.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Autorização</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {validationResult.dataAutorizacao
                        ? new Date(validationResult.dataAutorizacao).toLocaleString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Erros */}
              {validationResult.erros.length > 0 && (
                <GlassCard>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">Mensagens</h4>
                  <div className="space-y-2">
                    {validationResult.erros.map((erro, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 rounded-xl p-3 ${
                          erro.severidade === "ERRO"
                            ? "bg-rose-50 dark:bg-rose-500/10"
                            : erro.severidade === "ALERTA"
                            ? "bg-amber-50 dark:bg-amber-500/10"
                            : "bg-blue-50 dark:bg-blue-500/10"
                        }`}
                      >
                        {erro.severidade === "ERRO" ? (
                          <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                        ) : erro.severidade === "ALERTA" ? (
                          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 shrink-0 text-blue-500" />
                        )}
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-500">{erro.codigo}</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{erro.mensagem}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          ) : (
            <GlassCard className="h-full flex flex-col items-center justify-center">
              <Globe className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-slate-500 text-center">
                Selecione uma nota fiscal ao lado para validar junto ao ADN / SEFAZ
              </p>
            </GlassCard>
          )}

          {/* Histórico Recente */}
          <GlassCard>
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Validações Recentes</h3>
            </div>
            {historyData?.data && historyData.data.length > 0 ? (
              <div className="space-y-2">
                {historyData.data.slice(0, 5).map((item: any) => (
                  <div key={item.PK_validacao_id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <DocumentIcon type={item.tipo_documento === "NFE" ? "nfe" : "nfse"} size="sm" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {item.nome_emitente}
                      </span>
                    </div>
                    <Badge variant={situacaoBadgeVariant(item.situacao_fiscal)} className="text-xs">
                      {item.situacao_fiscal}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma validação ainda.</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}