import { useEffect, useState } from "react";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Search, ChevronLeft, ChevronRight, FileText, Filter } from "lucide-react";

interface LogEntry {
  PK_log_id: string;
  fk_usuario_id: string | null;
  modulo: string;
  acao: string;
  tabela_afetada: string | null;
  registro_afetado_id: string | null;
  descricao: string;
  detalhes: string | null;
  endereco_ip: string;
  agente_usuario: string;
  data_criacao: string;
  usuario: {
    PK_usuario_id: string;
    nome: string;
    email: string;
  } | null;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtroModulo, setFiltroModulo] = useState("");
  const [filtroAcao, setFiltroAcao] = useState("");

  const buscarLogs = async (pagina = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagina),
        pageSize: "20",
      });
      if (filtroModulo) params.append("modulo", filtroModulo);
      if (filtroAcao) params.append("acao", filtroAcao);

      const response = await api.get<LogsResponse>(`/logs-sistema?${params}`);
      setLogs(response.data.logs);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
      setPage(pagina);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarLogs();
  }, [filtroModulo, filtroAcao]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAcaoBadgeVariant = (acao: string) => {
    if (acao.includes("CONCLUIDA") || acao.includes("VALIDO")) return "success";
    if (acao.includes("FALHOU") || acao.includes("ERRO")) return "error";
    if (acao.includes("PARCIAL")) return "warning";
    return "info";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Logs do Sistema</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} registros encontrados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filtroModulo}
              onChange={(e) => { setFiltroModulo(e.target.value); }}
              className="flex-1 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <option value="">Todos os módulos</option>
              <option value="XML">XML</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Filtrar por ação..."
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/60"
            />
          </div>
          <Button onClick={() => buscarLogs(page)}>Filtrar</Button>
        </div>
      </GlassCard>

      {/* Tabela de Logs */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandGreen-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <FileText className="h-12 w-12 mb-4" />
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Módulo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ação</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {logs.map((log) => (
                  <tr key={log.PK_log_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(log.data_criacao)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.usuario ? (
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{log.usuario.nome}</p>
                          <p className="text-xs text-slate-500">{log.usuario.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{log.modulo}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getAcaoBadgeVariant(log.acao) as any}>{log.acao}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.descricao}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                      {log.endereco_ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/50 dark:border-slate-700/50">
            <p className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => buscarLogs(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => buscarLogs(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
