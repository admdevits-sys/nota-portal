import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Banknote,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Shield,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Package,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import { Badge } from "../components/ui/badge";
import { GlassCard } from "../components/ui/glass-card";
import { useSidebar } from "../components/ResponsiveShell";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatBRLCompact(value: number, compact = false) {
  if (value >= 1000000000) {
    const num = value / 1000000000;
    return `R$ ${compact ? num.toFixed(1).replace(/\.0$/, "") : num.toFixed(1)} Bi`;
  }
  if (value >= 1000000) {
    const num = value / 1000000;
    return `R$ ${compact ? num.toFixed(1).replace(/\.0$/, "") : num.toFixed(1)} Mi`;
  }
  if (value >= 1000) {
    const num = value / 1000;
    if (num >= 100) {
      return `R$ ${compact ? Math.round(num) : Math.round(num)} Mil`;
    }
    return `R$ ${compact ? num.toFixed(1).replace(/\.0$/, "") : num.toFixed(1)} Mil`;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

type FluxoCaixaItem = { label: string; total: number };
type TopCliente = { nome: string; total: number };
type TopProduto = { descricao: string; quantidade: number };

type ImpostosResumo = {
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  issqn: number;
  total: number;
};

// Modern stat card component
function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "blue",
  badge,
  compactValue = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  variant?: "green" | "red" | "silver" | "amber" | "rose";
  badge?: string;
  compactValue?: boolean;
}) {
  const colors = {
    blue: "from-brandGreen-500 to-brandGreen-600",
    emerald: "from-brandGreen-500 to-brandGreen-600",
    violet: "from-brandRed-500 to-brandRed-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-brandRed-500 to-brandRed-600",
  };

  return (
    <GlassCard className="group relative overflow-hidden">
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[variant]} opacity-0 transition-opacity duration-500 group-hover:opacity-10`} />

      <div className="relative flex items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
          <p className={`${compactValue ? "text-lg sm:text-xl lg:text-2xl" : "text-xl sm:text-2xl md:text-3xl"} font-bold text-slate-900 dark:text-white truncate`}>{value}</p>

          {trend && (
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${trend.value >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {trend.value >= 0 ? <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500">{trend.label}</span>
            </div>
          )}

          {badge && <Badge variant={variant === "green" ? "nfe" : variant === "red" ? "nfse" : "info"} size="sm">{badge}</Badge>}
        </div>

        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[variant]} shadow-lg transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
        </div>
      </div>
    </GlassCard>
  );
}

export function DashboardPage() {
  const { sidebarCollapsed } = useSidebar();

  const statusQuery = useQuery({
    queryKey: ["dashboard", "importacoes", "statusCount"],
    queryFn: async () => {
      const res = await api.get<{ data: Record<string, number> }>("/dashboard/importacoes/status-count");
      return res.data.data;
    },
    staleTime: 10000,
  });

  const faturamentoQuery = useQuery({
    queryKey: ["dashboard", "faturamento", "total"],
    queryFn: async () => {
      const res = await api.get<{ total: number }>("/dashboard/faturamento/total");
      return res.data.total;
    },
    staleTime: 10000,
  });

  const fluxoQuery = useQuery({
    queryKey: ["dashboard", "fluxo-caixa"],
    queryFn: async () => {
      const res = await api.get<{ data: FluxoCaixaItem[] }>("/dashboard/fluxo-caixa");
      return res.data.data;
    },
    staleTime: 10000,
  });

  const topClientesQuery = useQuery({
    queryKey: ["dashboard", "top-clientes"],
    queryFn: async () => {
      const res = await api.get<{ data: TopCliente[] }>("/dashboard/top-clientes");
      return res.data.data;
    },
    staleTime: 10000,
  });

  const topProdutosQuery = useQuery({
    queryKey: ["dashboard", "top-produtos"],
    queryFn: async () => {
      const res = await api.get<{ data: TopProduto[] }>("/dashboard/top-produtos");
      return res.data.data;
    },
    staleTime: 10000,
  });

  const impostosQuery = useQuery({
    queryKey: ["dashboard", "impostos", "resumo"],
    queryFn: async () => {
      const res = await api.get<{ data: ImpostosResumo }>("/dashboard/impostos/resumo");
      return res.data.data;
    },
    staleTime: 10000,
  });

  const concluido = statusQuery.data?.CONCLUIDO ?? 0;
  const parcial = statusQuery.data?.PARCIAL ?? 0;
  const processando = statusQuery.data?.PROCESSANDO ?? 0;
  const pendente = statusQuery.data?.PENDENTE ?? 0;
  const falhou = statusQuery.data?.FALHOU ?? 0;
  const error = statusQuery.error || faturamentoQuery.error || fluxoQuery.error || topClientesQuery.error || topProdutosQuery.error || impostosQuery.error;

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <GlassCard className="border-rose-200/50 bg-rose-50/80 dark:border-rose-800/50 dark:bg-rose-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/20">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-semibold text-rose-700 dark:text-rose-300">Erro ao carregar dados</p>
              <p className="text-sm text-rose-600 dark:text-rose-400">Faça login novamente ou tente novamente mais tarde.</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brandGreen-500 to-brandGreen-600 shadow-lg shadow-brandGreen-500/30">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Painel de Controle</h1>
              <p className="text-slate-500 dark:text-slate-400">Acompanhe suas métricas e resultados</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/import" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-brandGreen-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brandGreen-500/30 transition-all hover:scale-105 hover:shadow-xl">
            <FileText className="h-4 w-4" /> Nova Importação
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Faturado" value={faturamentoQuery.isLoading ? "—" : formatBRLCompact(faturamentoQuery.data ?? 0, !sidebarCollapsed)} icon={DollarSign} variant="emerald" trend={{ value: 12.5, label: "vs mês anterior" }} compactValue={!sidebarCollapsed} />
        <MetricCard label="Notas Concluídas" value={concluido} icon={CheckCircle} variant="blue" badge="NF-e / NFSe" />
        <MetricCard label="Em Processamento" value={processando} icon={Clock} variant="violet" />
        <MetricCard label="Taxa de Sucesso" value={`${concluido + parcial > 0 ? Math.round((concluido / (concluido + falhou + 0.001)) * 100) : 0}%`} icon={Target} variant="amber" badge={falhou > 0 ? `${falhou} falhas` : "Sem falhas"} />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/dashboard/notas">
          <GlassCard hover className="cursor-pointer group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brandGreen-500 to-brandGreen-600 shadow-lg shadow-brandGreen-500/30 transition-transform group-hover:scale-110 flex-shrink-0">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total de Notas</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">{concluido + parcial + processando + pendente}</p>
              </div>
              <Badge variant="nfe">NF-e</Badge>
            </div>
          </GlassCard>
        </Link>

        <Link to="/dashboard/import">
          <GlassCard hover className="cursor-pointer group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brandGreen-500 to-brandGreen-600 shadow-lg shadow-brandGreen-500/30 transition-transform group-hover:scale-110 flex-shrink-0">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Importações</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">{concluido + parcial}</p>
              </div>
              <Badge variant="nfse">NFSe</Badge>
            </div>
          </GlassCard>
        </Link>

        <GlassCard hover className="group sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brandRed-500 to-brandRed-600 shadow-lg shadow-brandRed-500/30 transition-transform group-hover:scale-110 flex-shrink-0">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Faturamento Mensal</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">{formatBRLCompact(faturamentoQuery.data ?? 0, !sidebarCollapsed)}</p>
            </div>
            <Badge variant="info" pulse>+12%</Badge>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-brandGreen-600 dark:text-brandGreen-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fluxo de Caixa</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Últimos 12 meses de faturamento</p>
            </div>
            <Badge variant="info" size="lg">Em tempo real</Badge>
          </div>

          <div className="h-80">
            {fluxoQuery.isLoading ? (
              <div className="skeleton h-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fluxoQuery.data ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008200" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#008200" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <Tooltip formatter={(value: number) => formatBRL(value)} contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 25px 50px -25px rgba(15, 23, 42, 0.25)" }} />
                  <Area type="monotone" dataKey="total" stroke="#008200" strokeWidth={3} fill="url(#gradientBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brandGreen-600 dark:text-brandGreen-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Clientes</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Maior receita por cliente</p>
          </div>

          {topClientesQuery.isLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-16 rounded-2xl" />
              <div className="skeleton h-16 rounded-2xl" />
              <div className="skeleton h-16 rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-3">
              {(topClientesQuery.data ?? []).map((client, index) => (
                <div key={client.nome} className="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-50/80 p-4 backdrop-blur-xl transition-all hover:scale-[1.02] hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-700">
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brandGreen-100 text-xs font-bold text-brandGreen-600 dark:bg-brandGreen-500/20 dark:text-brandGreen-300">
                    #{index + 1}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{client.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total faturado</p>
                    </div>
                    <p className="font-bold text-brandGreen-600 dark:text-brandGreen-400">{formatBRL(client.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-brandGreen-600 dark:text-brandGreen-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Produtos Mais Vendidos</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quantidade por item</p>
            </div>
          </div>

          <div className="h-80">
            {topProdutosQuery.isLoading ? (
              <div className="skeleton h-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProdutosQuery.data ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <XAxis dataKey="descricao" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} unidades`} contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 25px 50px -25px rgba(15, 23, 42, 0.25)" }} />
                  <Bar dataKey="quantidade" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {(topProdutosQuery.data ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#008200" : "#FF2B00"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-brandGreen-600 dark:text-brandGreen-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resumo de Impostos</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tributos acumulados</p>
          </div>

          {impostosQuery.isLoading ? (
            <div className="mt-6 space-y-3">
              <div className="skeleton h-14 rounded-2xl" />
              <div className="skeleton h-14 rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "ICMS", value: impostosQuery.data?.icms ?? 0, color: "green" },
                { label: "PIS", value: impostosQuery.data?.pis ?? 0, color: "red" },
                { label: "COFINS", value: impostosQuery.data?.cofins ?? 0, color: "silver" },
                { label: "ISSQN", value: impostosQuery.data?.issqn ?? 0, color: "green" },
              ].map((item) => (
                <div key={item.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-50/80 p-4 backdrop-blur-xl transition-all hover:scale-[1.02] hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatBRL(item.value)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className={`h-full rounded-full bg-gradient-to-r ${item.color === "green" ? "from-brandGreen-500 to-brandGreen-600" : item.color === "red" ? "from-brandRed-500 to-brandRed-600" : "from-brandSilver-500 to-brandSilver-600"}`} style={{ width: `${Math.min(100, ((item.value as number) / ((impostosQuery.data?.total as number) || 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}

              <div className="mt-6 rounded-2xl border border-brandGreen-200/50 bg-brandGreen-600 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/90">Total de Tributos</span>
                  <span className="text-2xl font-bold text-white">{formatBRL(impostosQuery.data?.total ?? 0)}</span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
</div>
  );
}