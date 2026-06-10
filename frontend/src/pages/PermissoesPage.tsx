import { useEffect, useState } from "react";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Users, Save, Shield, Check, X } from "lucide-react";

interface Permissao {
  PK_permissao_id: number;
  modulo: string;
  acao: string;
  descricao: string | null;
}

interface PermissaoPerfil {
  PK_permissao_perfil_id: number;
  fk_perfil_id: number;
  fk_permissao_id: number;
  ativo: boolean;
  permissao: Permissao;
}

interface Perfil {
  PK_perfil_id: number;
  nome: string;
  descricao: string | null;
  _count?: { usuarios: number };
}

interface PermissoesPerfil {
  perfil: {
    PK_perfil_id: number;
    nome: string;
    descricao: string | null;
  };
  permissoes: PermissaoPerfil[];
}

const MODULOS = [
  { key: "DASHBOARD", label: "Dashboard" },
  { key: "IMPORTACAO", label: "Importação XML" },
  { key: "VALIDACAO", label: "Validação XML" },
  { key: "NOTAS", label: "Notas Fiscais" },
  { key: "USUARIOS", label: "Usuários" },
  { key: "CADASTROS", label: "Cadastros" },
  { key: "LOGS", label: "Logs do Sistema" },
  { key: "CONFIG", label: "Configurações" },
];

const ACOES = [
  { key: "VIEW", label: "Visualizar" },
  { key: "CREATE", label: "Criar" },
  { key: "UPDATE", label: "Editar" },
  { key: "DELETE", label: "Excluir" },
  { key: "EXPORT", label: "Exportar" },
];

export function PermissoesPage() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [todasPermissoes, setTodasPermissoes] = useState<Permissao[]>([]);
  const [perfilSelecionado, setPerfilSelecionado] = useState<number | null>(null);
  const [permissoesPerfil, setPermissoesPerfil] = useState<PermissaoPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    setLoading(true);
    try {
      const [perfisRes, permissoesRes] = await Promise.all([
        api.get<Perfil[]>("/permissoes/perfis"),
        api.get<{ permissoes: Permissao[] }>("/permissoes"),
      ]);
      setPerfis(perfisRes.data);
      setTodasPermissoes(permissoesRes.data.permissoes);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const selecionarPerfil = async (perfilId: number) => {
    if (dirty && perfilSelecionado !== null) {
      if (!confirm("Existem alterações não salvas. Deseja descartá-las?")) {
        return;
      }
    }
    setPerfilSelecionado(perfilId);
    setDirty(false);
    try {
      const res = await api.get<PermissoesPerfil>(`/permissoes/perfis/${perfilId}`);
      setPermissoesPerfil(res.data.permissoes);
    } catch (err) {
      console.error("Erro ao buscar permissões do perfil:", err);
    }
  };

  const togglePermissao = (permissaoId: number) => {
    setPermissoesPerfil((prev) =>
      prev.map((p) =>
        p.fk_permissao_id === permissaoId ? { ...p, ativo: !p.ativo } : p
      )
    );
    setDirty(true);
  };

  const salvarPermissoes = async () => {
    if (perfilSelecionado === null) return;
    setSaving(true);
    try {
      const permissoes = permissoesPerfil.map((p) => ({
        fk_permissao_id: p.fk_permissao_id,
        ativo: p.ativo,
      }));
      await api.put(`/permissoes/perfis/${perfilSelecionado}`, { permissoes });
      setDirty(false);
      alert("Permissões salvas com sucesso!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erro ao salvar permissões.");
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = perfilSelecionado === 1;

  const getModuloPermissoes = (modulo: string) => {
    return permissoesPerfil.filter((p) => p.permissao.modulo === modulo);
  };

  const isPermissaoAtiva = (permissaoId: number) => {
    const p = permissoesPerfil.find((x) => x.fk_permissao_id === permissaoId);
    return p?.ativo ?? false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandGreen-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Permissões</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure as permissões de cada perfil para cada módulo do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de Perfis */}
        <GlassCard className="p-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Perfis
          </h2>
          <div className="space-y-2">
            {perfis.map((perfil) => (
              <button
                key={perfil.PK_perfil_id}
                onClick={() => selecionarPerfil(perfil.PK_perfil_id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  perfilSelecionado === perfil.PK_perfil_id
                    ? "bg-brandGreen-600 text-white shadow-lg"
                    : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <p className="font-semibold text-sm">{perfil.nome}</p>
                <p className={`text-xs ${
                  perfilSelecionado === perfil.PK_perfil_id
                    ? "text-brandGreen-100"
                    : "text-slate-500"
                }`}>
                  {perfil._count?.usuarios ?? 0} usuários
                </p>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Matriz de Permissões */}
        <div className="lg:col-span-3 space-y-4">
          {perfilSelecionado === null ? (
            <GlassCard className="p-8 text-center text-slate-400">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um perfil para gerenciar suas permissões</p>
            </GlassCard>
          ) : isAdmin ? (
            <GlassCard className="p-8 text-center text-slate-400">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold">Perfil Admin</p>
              <p className="text-sm mt-2">O perfil Admin possui todas as permissões automaticamente e não pode ser alterado.</p>
            </GlassCard>
          ) : (
            <>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Permissões: {perfis.find((p) => p.PK_perfil_id === perfilSelecionado)?.nome}
                  </h2>
                  <Button
                    onClick={salvarPermissoes}
                    disabled={!dirty || saving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">
                          Módulo
                        </th>
                        {ACOES.map((acao) => (
                          <th key={acao.key} className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">
                            {acao.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                      {MODULOS.map((modulo) => {
                        const moduloPermissoes = todasPermissoes.filter((p) => p.modulo === modulo.key);
                        if (moduloPermissoes.length === 0) return null;

                        return (
                          <tr key={modulo.key}>
                            <td className="px-3 py-3">
                              <Badge variant="default">{modulo.label}</Badge>
                            </td>
                            {ACOES.map((acao) => {
                              const permissao = moduloPermissoes.find((p) => p.acao === acao.key);
                              if (!permissao) {
                                return (
                                  <td key={acao.key} className="px-3 py-3 text-center">
                                    <span className="text-slate-300">—</span>
                                  </td>
                                );
                              }
                              const ativo = isPermissaoAtiva(permissao.PK_permissao_id);
                              return (
                                <td key={acao.key} className="px-3 py-3 text-center">
                                  <button
                                    onClick={() => togglePermissao(permissao.PK_permissao_id)}
                                    className={`inline-flex items-center justify-center h-8 w-8 rounded-full transition-all ${
                                      ativo
                                        ? "bg-green-500 text-white"
                                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                                    }`}
                                  >
                                    {ativo ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {dirty && (
                  <p className="text-sm text-amber-600 mt-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    Alterações não salvas
                  </p>
                )}
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
