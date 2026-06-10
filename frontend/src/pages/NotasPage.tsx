import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { SelectField } from "../components/ui/select";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";
import { DocumentIcon } from "../components/ui/document-icon";
import { XmlViewer } from "../components/XmlViewer";
import {
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Building2,
  Hash,
  DollarSign,
  X,
  RefreshCw,
  Code2,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const notasFilterSchema = z.object({
  tipo_documento: z.enum(["ALL", "NFE", "NFSE"]).default("ALL"),
  documento_emitente: z.string().max(50).optional(),
  data_ini: z.string().optional(),
  data_fim: z.string().optional(),
});

type NotasFilterInput = z.infer<typeof notasFilterSchema>;

type NotaItem = {
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
};

export function NotasPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<NotasFilterInput>({
    tipo_documento: "ALL",
    documento_emitente: "",
    data_ini: "",
    data_fim: "",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [selectedNota, setSelectedNota] = useState<NotaItem | null>(null);
  const [showXmlViewer, setShowXmlViewer] = useState(false);
  const [notaToDelete, setNotaToDelete] = useState<NotaItem | null>(null);
  const queryClient = useQueryClient();

  const deleteNotaMutation = useMutation({
    mutationFn: async (notaId: string) => {
      await api.delete(`/import/notas/${notaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "notas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "importacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "faturamento"] });
      setNotaToDelete(null);
    },
  });

  const form = useForm<NotasFilterInput>({
    resolver: zodResolver(notasFilterSchema),
    defaultValues: filters,
  });

  const tipoDocumento = form.watch("tipo_documento");

  const notasQuery = useQuery<
    {
      data: NotaItem[];
      meta: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
      };
    },
    Error
  >({
    queryKey: ["dashboard", "notas", filters, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: 10 };
      const tipo =
        filters.tipo_documento === "ALL" ? "" : filters.tipo_documento;
      if (tipo) params.tipo_documento = tipo;
      if (filters.documento_emitente) params.documento_emitente = filters.documento_emitente;
      if (filters.data_ini) params.data_ini = filters.data_ini;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      const res = await api.get<
        {
          data: NotaItem[];
          meta: {
            page: number;
            pageSize: number;
            totalCount: number;
            totalPages: number;
          };
        }
      >("/dashboard/notas", { params });
      return res.data;
    },
  });

  const onSubmit = (values: NotasFilterInput) => {
    setFilters(values);
    setPage(1);
  };

  const clearFilters = () => {
    form.reset({
      tipo_documento: "ALL",
      documento_emitente: "",
      data_ini: "",
      data_fim: "",
    });
    setFilters({
      tipo_documento: "ALL",
      documento_emitente: "",
      data_ini: "",
      data_fim: "",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.tipo_documento !== "ALL" ||
    filters.documento_emitente !== "" ||
    filters.data_ini !== "" ||
    filters.data_fim !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg shadow-brandGreen-500/30">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notas Fiscais
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Filtre e navegue pelas notas processadas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="text-sm">
            Página {page}
          </Badge>
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
              showFilters
                ? "border-brandGreen-200 bg-brandGreen-50 text-brandGreen-700 dark:border-brandGreen-700 dark:bg-brandGreen-500/20 dark:text-brandGreen-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <GlassCard>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-end gap-4 lg:grid lg:grid-cols-4">
              <SelectField
                label="Tipo de documento"
                value={tipoDocumento}
                onValueChange={(value) =>
                  form.setValue(
                    "tipo_documento",
                    value as "ALL" | "NFE" | "NFSE"
                  )
                }
                options={[
                  { value: "ALL", label: "Todos" },
                  { value: "NFE", label: "NF-e" },
                  { value: "NFSE", label: "NFSe" },
                ]}
              />
              <label className="flex-1 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2 font-medium">
                  <Building2 className="h-4 w-4" />
                  Emitente
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-brandGreen-500 dark:focus:ring-brandGreen-800"
                  placeholder="CNPJ/CPF"
                  {...form.register("documento_emitente")}
                />
              </label>
              <label className="flex-1 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4" />
                  Data início
                </span>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-brandGreen-500 dark:focus:ring-brandGreen-800"
                  {...form.register("data_ini")}
                />
              </label>
              <label className="flex-1 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4" />
                  Data fim
                </span>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-brandGreen-500 dark:focus:ring-brandGreen-800"
                  {...form.register("data_fim")}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-brandGreen-light px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brandGreen-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-brandGreen-500/40"
              >
                <Search className="h-4 w-4" />
                Aplicar filtros
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-hidden rounded-3xl">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-800/80">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tipo
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chave de Acesso
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Emissão
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Emitente
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Valor
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {notasQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-brandGreen-500" />
                      <p className="text-slate-500">Carregando notas...</p>
                    </div>
                  </td>
                </tr>
              ) : notasQuery.error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-rose-600"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <p className="font-semibold">
                        Falha ao carregar notas. Faça login novamente ou recarregue
                        a página.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : notasQuery.data?.data.length ? (
                notasQuery.data.data.map((nota) => (
                  <tr
                    key={nota.PK_nota_fiscal_id}
                    className="group border-b border-slate-100 transition-all hover:bg-slate-50/80 dark:border-slate-700/30 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4">
                      <Badge
                        variant={nota.tipo_documento === "NFE" ? "nfe" : "nfse"}
                        className="font-bold"
                      >
                        {nota.tipo_documento === "NFE" ? "NF-e" : "NFSe"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-slate-400" />
                        <span className="max-w-[200px] truncate font-mono text-xs text-slate-600 dark:text-slate-400">
                          {nota.chave_acesso}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {new Date(nota.data_emissao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {nota.nome_emitente}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {nota.documento_emitente}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          R${" "}
                          {(
                            typeof nota.valor_total === "number"
                              ? nota.valor_total
                              : Number(nota.valor_total || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedNota(nota);
                            setShowXmlViewer(true);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-brandGreen-light px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Ver</span>
                        </button>
                        <button
                          onClick={() => {
                            setNotaToDelete(nota);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Eye className="h-10 w-10 text-slate-300" />
                      <p className="font-semibold">
                        Nenhuma nota encontrada para os filtros selecionados.
                      </p>
                      <p className="text-xs">
                        Tente ajustar os filtros ou importe novas notas fiscais.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Pagination */}
      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Página{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {notasQuery.data?.meta.page ?? page}
              </span>{" "}
              de{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {notasQuery.data?.meta.totalPages ?? 1}
              </span>
            </p>
            {notasQuery.data?.meta.totalCount && (
              <Badge variant="default" className="text-xs">
                {notasQuery.data.meta.totalCount} registros
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= (notasQuery.data?.meta.totalPages ?? 1)}
              onClick={() => setPage((prev) => prev + 1)}
              className="flex items-center gap-2 rounded-2xl bg-brandGreen-light px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* XML Viewer Modal */}
      <XmlViewer
        isOpen={showXmlViewer}
        onClose={() => {
          setShowXmlViewer(false);
          setSelectedNota(null);
        }}
        nota={selectedNota}
      />

      {/* Delete Confirmation Modal */}
      {notaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setNotaToDelete(null)} />
          <GlassCard className="relative z-10 mx-4 w-full max-w-md animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Excluir Nota Fiscal
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Tem certeza que deseja excluir a nota{" "}
                <span className="font-bold">{notaToDelete.numero_documento}</span>?
              </p>
              <p className="mt-1 text-xs text-rose-500">
                Esta ação excluirá todos os dados importados pelo XML e não pode ser desfeita.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setNotaToDelete(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteNotaMutation.mutate(notaToDelete.PK_nota_fiscal_id)}
                disabled={deleteNotaMutation.isPending}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteNotaMutation.isPending ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}