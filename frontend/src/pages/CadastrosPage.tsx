import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";
import {
  Building2,
  Package,
  Wrench,
  Plus,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Save,
} from "lucide-react";

const empresaSchema = z.object({
  cnpj_cpf: z.string().min(5, "Informe CNPJ/CPF"),
  razao_social: z.string().min(2, "Informe a razão social"),
  nome_fantasia: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().length(2, "UF deve ter 2 caracteres").optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
});

const produtoSchema = z.object({
  codigo: z.string().min(1, "Informe o código"),
  descricao: z.string().min(2, "Informe a descrição"),
  ncm: z.string().optional(),
  cfop: z.string().optional(),
  unidade: z.string().optional(),
  preco: z.preprocess((value) => Number(value), z.number().nonnegative("Informe um preço válido")),
});

const servicoSchema = z.object({
  codigo: z.string().min(1, "Informe o código"),
  descricao: z.string().min(2, "Informe a descrição"),
  preco: z.preprocess((value) => Number(value), z.number().nonnegative("Informe um preço válido")),
  categoria: z.string().optional(),
});

type EmpresaInput = z.infer<typeof empresaSchema>;
type ProdutoInput = z.infer<typeof produtoSchema>;
type ServicoInput = z.infer<typeof servicoSchema>;

type EmpresaItem = {
  PK_empresa_id: string;
  cnpj_cpf: string;
  razao_social: string;
  nome_fantasia?: string | null;
};

type ProdutoItem = {
  PK_produto_id: string;
  codigo: string;
  descricao: string;
  preco: number | string;
};

type ServicoItem = {
  PK_servico_id: string;
  codigo: string;
  descricao: string;
  preco: number | string;
};

type ListResponse<T> = {
  data: T[];
  meta: { page: number; pageSize: number; totalCount: number; totalPages: number };
};

const tabs = [
  { key: "empresas", label: "Empresas", icon: Building2 },
  { key: "produtos", label: "Produtos", icon: Package },
  { key: "servicos", label: "Serviços", icon: Wrench },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function CadastrosPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("empresas");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(true);

  const formatCurrency = (value: number | string | undefined | null) => {
    if (value == null || value === "") return "—";
    const normalized = typeof value === "string" ? value.replace(/,/g, ".") : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed.toFixed(2) : "—";
  };

  const empresaForm = useForm<EmpresaInput>({
    resolver: zodResolver(empresaSchema),
    defaultValues: { cnpj_cpf: "", razao_social: "", nome_fantasia: "", endereco: "", cidade: "", uf: "", telefone: "", email: "" },
  });

  const produtoForm = useForm<ProdutoInput>({
    resolver: zodResolver(produtoSchema),
    defaultValues: { codigo: "", descricao: "", ncm: "", cfop: "", unidade: "", preco: 0 },
  });

  const servicoForm = useForm<ServicoInput>({
    resolver: zodResolver(servicoSchema),
    defaultValues: { codigo: "", descricao: "", preco: 0, categoria: "" },
  });

  const empresasQuery = useQuery<ListResponse<EmpresaItem>, Error>({
    queryKey: ["cadastros", "empresas", page, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: 10 };
      if (search) params.q = search;
      const res = await api.get<ListResponse<EmpresaItem>>("/cadastros/empresas", { params });
      return res.data;
    },
  });

  const produtosQuery = useQuery<ListResponse<ProdutoItem>, Error>({
    queryKey: ["cadastros", "produtos", page, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: 10 };
      if (search) params.q = search;
      const res = await api.get<ListResponse<ProdutoItem>>("/cadastros/produtos", { params });
      return res.data;
    },
  });

  const servicosQuery = useQuery<ListResponse<ServicoItem>, Error>({
    queryKey: ["cadastros", "servicos", page, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: 10 };
      if (search) params.q = search;
      const res = await api.get<ListResponse<ServicoItem>>("/cadastros/servicos", { params });
      return res.data;
    },
  });

  const createEmpresa = useMutation({
    mutationFn: async (values: EmpresaInput) => api.post("/cadastros/empresas", values),
    onSuccess: () => {
      empresaForm.reset();
      queryClient.invalidateQueries({ queryKey: ["cadastros", "empresas"] });
    },
  });

  const createProduto = useMutation({
    mutationFn: async (values: ProdutoInput) => api.post("/cadastros/produtos", values),
    onSuccess: () => {
      produtoForm.reset();
      queryClient.invalidateQueries({ queryKey: ["cadastros", "produtos"] });
    },
  });

  const createServico = useMutation({
    mutationFn: async (values: ServicoInput) => api.post("/cadastros/servicos", values),
    onSuccess: () => {
      servicoForm.reset();
      queryClient.invalidateQueries({ queryKey: ["cadastros", "servicos"] });
    },
  });

  const queryData = useMemo(() => {
    if (tab === "empresas") return empresasQuery.data;
    if (tab === "produtos") return produtosQuery.data;
    return servicosQuery.data;
  }, [tab, empresasQuery.data, produtosQuery.data, servicosQuery.data]);

  const isLoading = tab === "empresas" ? empresasQuery.isLoading : tab === "produtos" ? produtosQuery.isLoading : servicosQuery.isLoading;
  const error = tab === "empresas" ? empresasQuery.error : tab === "produtos" ? produtosQuery.error : servicosQuery.error;

  const currentTab = tabs.find((t) => t.key === tab);
  const TabIcon = currentTab?.icon ?? Building2;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg shadow-brandGreen-500/30">
            <TabIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cadastros</h2>
            <p className="text-slate-500 dark:text-slate-400">Registre empresas, produtos e serviços</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${showForm ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-500/20" : "bg-brandGreen-light text-white shadow-lg"}`}
        >
          {showForm ? <><X className="h-4 w-4" /> Ocultar</> : <><Plus className="h-4 w-4" /> Mostrar</>}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => { setTab(item.key); setPage(1); setSearch(""); }}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${tab === item.key ? "bg-brandGreen-light text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-slate-100 dark:bg-slate-800/80"}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {showForm && (
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-light text-white">
              <Pencil className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Novo {tab === "empresas" ? "registro de empresa" : tab === "produtos" ? "produto" : "serviço"}
            </h3>
          </div>

          <form
            onSubmit={tab === "empresas" ? empresaForm.handleSubmit((v) => createEmpresa.mutate(v)) : tab === "produtos" ? produtoForm.handleSubmit((v) => createProduto.mutate(v)) : servicoForm.handleSubmit((v) => createServico.mutate(v))}
            className="space-y-6"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {tab === "empresas" ? (
                <>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">CNPJ / CPF *</span>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" placeholder="00.000.000/0000-00" {...empresaForm.register("cnpj_cpf")} />
                    {empresaForm.formState.errors.cnpj_cpf?.message && <p className="text-xs text-rose-600">{empresaForm.formState.errors.cnpj_cpf.message}</p>}
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Razão social *</span>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" placeholder="Nome da empresa" {...empresaForm.register("razao_social")} />
                    {empresaForm.formState.errors.razao_social?.message && <p className="text-xs text-rose-600">{empresaForm.formState.errors.razao_social.message}</p>}
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Nome fantasia</span>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...empresaForm.register("nome_fantasia")} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Endereço</span>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...empresaForm.register("endereco")} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Cidade</span>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...empresaForm.register("cidade")} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">UF</span>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" maxLength={2} {...empresaForm.register("uf")} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Telefone</span>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...empresaForm.register("telefone")} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Email</span>
                    <input type="email" className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...empresaForm.register("email")} />
                    {empresaForm.formState.errors.email?.message && <p className="text-xs text-rose-600">{empresaForm.formState.errors.email.message}</p>}
                  </label>
                </>
              ) : tab === "produtos" ? (
                <>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Código *</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...produtoForm.register("codigo")} />{produtoForm.formState.errors.codigo?.message && <p className="text-xs text-rose-600">{produtoForm.formState.errors.codigo.message}</p>}</label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Descrição *</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...produtoForm.register("descricao")} />{produtoForm.formState.errors.descricao?.message && <p className="text-xs text-rose-600">{produtoForm.formState.errors.descricao.message}</p>}</label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">NCM</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...produtoForm.register("ncm")} /></label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">CFOP</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...produtoForm.register("cfop")} /></label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Unidade</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...produtoForm.register("unidade")} /></label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Preço *</span><input type="number" step="0.01" className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...produtoForm.register("preco", { valueAsNumber: true })} />{produtoForm.formState.errors.preco?.message && <p className="text-xs text-rose-600">{produtoForm.formState.errors.preco.message}</p>}</label>
                </>
              ) : (
                <>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Código *</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...servicoForm.register("codigo")} />{servicoForm.formState.errors.codigo?.message && <p className="text-xs text-rose-600">{servicoForm.formState.errors.codigo.message}</p>}</label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Descrição *</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...servicoForm.register("descricao")} />{servicoForm.formState.errors.descricao?.message && <p className="text-xs text-rose-600">{servicoForm.formState.errors.descricao.message}</p>}</label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Preço *</span><input type="number" step="0.01" className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...servicoForm.register("preco", { valueAsNumber: true })} />{servicoForm.formState.errors.preco?.message && <p className="text-xs text-rose-600">{servicoForm.formState.errors.preco.message}</p>}</label>
                  <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Categoria</span><input className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" {...servicoForm.register("categoria")} /></label>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/50 pt-6 dark:border-slate-700/50">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800">Cancelar</button>
              <button type="submit" disabled={tab === "empresas" ? createEmpresa.isPending : tab === "produtos" ? createProduto.isPending : createServico.isPending} className="flex items-center gap-2 rounded-2xl bg-brandGreen-light px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-60">
                <Save className="h-4 w-4" />
                {tab === "empresas" ? createEmpresa.isPending ? "Salvando..." : "Criar empresa" : tab === "produtos" ? createProduto.isPending ? "Salvando..." : "Criar produto" : createServico.isPending ? "Salvando..." : "Criar serviço"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={tab === "empresas" ? "nfe" : tab === "produtos" ? "info" : "nfse"}>{currentTab?.label}</Badge>
            <p className="text-sm text-slate-500">Busque e navegue pelos registros</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setPage(1)} placeholder="Buscar..." className="min-w-[200px] rounded-2xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-sm outline-none focus:border-brandGreen-500 dark:border-slate-700 dark:bg-slate-800/80" />
            </div>
            <button type="button" onClick={() => setPage(1)} className="flex items-center gap-2 rounded-2xl bg-brandGreen-light px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105">
              <Search className="h-4 w-4" /> Buscar
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80">
                {tab === "empresas" ? (
                  <><th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">CNPJ / CPF</th><th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Razão social</th><th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Nome fantasia</th></>
                ) : (
                  <><th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Código</th><th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Descrição</th><th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Preço</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="px-4 py-12 text-center"><div className="flex flex-col items-center gap-3"><RefreshCw className="h-8 w-8 animate-spin text-brandGreen-500" /><p className="text-slate-500">Carregando...</p></div></td></tr>
              ) : error ? (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-rose-600">Erro ao carregar registros.</td></tr>
              ) : queryData?.data.length ? (
                queryData.data.map((item: unknown, index: number) => (
                  <tr key={(item as { PK_empresa_id?: string; PK_produto_id?: string; PK_servico_id?: string }).PK_empresa_id || (item as { PK_produto_id?: string }).PK_produto_id || (item as { PK_servico_id?: string }).PK_servico_id || `item-${index}`} className="group border-b border-slate-100 transition-all hover:bg-slate-50/80 dark:border-slate-700/30 dark:hover:bg-slate-800/50">
                    {tab === "empresas" ? (
                      <><td className="px-4 py-4 font-mono text-xs text-slate-600">{(item as EmpresaItem).cnpj_cpf}</td><td className="px-4 py-4 font-semibold text-slate-900">{(item as EmpresaItem).razao_social}</td><td className="px-4 py-4 text-slate-600">{(item as EmpresaItem).nome_fantasia ?? "—"}</td></>
                    ) : tab === "produtos" ? (
                      <><td className="px-4 py-4 font-mono text-xs text-slate-600">{(item as ProdutoItem).codigo}</td><td className="px-4 py-4 font-semibold text-slate-900">{(item as ProdutoItem).descricao}</td><td className="px-4 py-4 font-bold text-emerald-600">R$ {formatCurrency((item as ProdutoItem).preco)}</td></>
                    ) : (
                      <><td className="px-4 py-4 font-mono text-xs text-slate-600">{(item as ServicoItem).codigo}</td><td className="px-4 py-4 font-semibold text-slate-900">{(item as ServicoItem).descricao}</td><td className="px-4 py-4 font-bold text-emerald-600">R$ {formatCurrency((item as ServicoItem).preco)}</td></>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-4 py-12 text-center"><div className="flex flex-col items-center gap-3"><Eye className="h-10 w-10 text-slate-300" /><p className="font-semibold text-slate-600">Nenhum registro encontrado.</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600">Página <span className="font-bold">{queryData?.meta.page ?? page}</span> de <span className="font-bold">{queryData?.meta.totalPages ?? 1}</span></p>
            {queryData?.meta.totalCount && <Badge variant="default" className="text-xs">{queryData.meta.totalCount} registros</Badge>}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200"><ChevronLeft className="h-4 w-4" /> Anterior</button>
            <button type="button" disabled={page >= (queryData?.meta.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-2 rounded-2xl bg-brandGreen-light px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-40">Próxima <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}