import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  Trash2,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";

const usuarioSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  perfilNome: z.enum(["ADMIN", "OPERADOR", "AUDITOR"]),
});

const usuarioEditSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres").optional(),
  perfilNome: z.enum(["ADMIN", "OPERADOR", "AUDITOR"]),
});

type UsuarioInput = z.infer<typeof usuarioSchema>;
type UsuarioUpdateFormInput = z.infer<typeof usuarioEditSchema>;
type UsuarioItem = {
  usuarioId: string;
  nome: string;
  email: string;
  perfilNome: "ADMIN" | "OPERADOR" | "AUDITOR";
  ativo: boolean;
  data_criacao: string;
  canDelete: boolean;
};

type UsuariosResponse = {
  data: UsuarioItem[];
  meta: { page: number; pageSize: number; totalCount: number; totalPages: number };
};

// ─── Perfil helpers ────────────────────────────────────────────────────────────

function perfilMeta(perfil: string) {
  if (perfil === "ADMIN") return { icon: Shield, label: "Admin", variant: "brandRed" as const };
  if (perfil === "AUDITOR") return { icon: ShieldAlert, label: "Auditor", variant: "warning" as const };
  return { icon: ShieldCheck, label: "Operador", variant: "info" as const };
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <tbody>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
          {[180, 220, 100, 80, 120, 100].map((w, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-4 w-full max-w-[160px] animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function UsuariosPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ user: UsuarioItem; action: "deactivate" | "activate" | "delete" } | null>(null);

  const form = useForm<UsuarioInput>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nome: "", email: "", senha: "", perfilNome: "OPERADOR" },
  });

  const usuariosQuery = useQuery<UsuariosResponse, Error, UsuariosResponse>({
    queryKey: ["cadastros", "usuarios", page, search] as const,
    queryFn: async (): Promise<UsuariosResponse> => {
      const params: Record<string, string | number> = { page, pageSize: 10 };
      if (search) params.q = search;
      const res = await api.get<UsuariosResponse>("/cadastros/usuarios", { params });
      return res.data;
    },
  });

  const editForm = useForm<UsuarioUpdateFormInput>({
    resolver: zodResolver(usuarioEditSchema),
    defaultValues: { nome: "", email: "", senha: "", perfilNome: "OPERADOR" },
  });

  const createUsuario = useMutation({
    mutationFn: async (values: UsuarioInput) => api.post("/cadastros/usuarios", values),
    onSuccess: () => {
      form.reset({ nome: "", email: "", senha: "", perfilNome: "OPERADOR" });
      setShowForm(false);
      setSelectedUser(null);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["cadastros", "usuarios"] });
    },
  });

  const updateUsuario = useMutation({
    mutationFn: async ({ usuarioId, values }: { usuarioId: string; values: UsuarioUpdateFormInput }) =>
      api.put(`/cadastros/usuarios/${usuarioId}`, values),
    onSuccess: () => {
      setSelectedUser(null);
      setIsEditing(false);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["cadastros", "usuarios"] });
    },
  });

  const usuarioAction = useMutation({
    mutationFn: async ({ usuarioId, force = false }: { usuarioId: string; force?: boolean }) =>
      api.delete(`/cadastros/usuarios/${usuarioId}`, { params: force ? { force: true } : {} }),
    onSuccess: () => {
      setSelectedUser(null);
      setIsEditing(false);
      setIsDialogOpen(false);
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["cadastros", "usuarios"] });
    },
  });

  const activateUsuario = useMutation({
    mutationFn: async (usuarioId: string) => api.patch(`/cadastros/usuarios/${usuarioId}/activate`),
    onSuccess: () => {
      setSelectedUser(null);
      setIsEditing(false);
      setIsDialogOpen(false);
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["cadastros", "usuarios"] });
    },
  });

  const handleViewUser = (user: UsuarioItem) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UsuarioItem) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowForm(false);
    editForm.reset({ nome: user.nome, email: user.email, senha: "", perfilNome: user.perfilNome });
    setIsDialogOpen(true);
  };

  const handleDeactivateUser = (user: UsuarioItem) => {
    if (!user.ativo) return;
    setConfirmAction({ user, action: "deactivate" });
  };

  const handleActivateUser = (user: UsuarioItem) => {
    if (user.ativo) return;
    setConfirmAction({ user, action: "activate" });
  };

  const handleDeleteUser = (user: UsuarioItem) => {
    if (!user.canDelete) return;
    setConfirmAction({ user, action: "delete" });
  };

  const confirmActionHandler = () => {
    if (!confirmAction) return;
    const { user, action } = confirmAction;
    if (action === "activate") {
      activateUsuario.mutate(user.usuarioId);
    } else if (action === "deactivate") {
      usuarioAction.mutate({ usuarioId: user.usuarioId, force: false });
    } else {
      usuarioAction.mutate({ usuarioId: user.usuarioId, force: true });
    }
  };

  const totalPages = usuariosQuery.data?.meta.totalPages ?? 1;
  const totalCount = usuariosQuery.data?.meta.totalCount ?? 0;
  const isCreating = createUsuario.isPending;
  const isUpdating = updateUsuario.isPending;
  const isDeleting = usuarioAction.isPending;
  const isActivating = activateUsuario.isPending;

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg shadow-brandGreen-500/30">
              <Users className="h-5 w-5 text-white" />
            </span>
            Usuários
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {totalCount > 0
              ? `${totalCount} usuário${totalCount !== 1 ? "s" : ""} cadastrado${totalCount !== 1 ? "s" : ""}`
              : "Gerencie contas de acesso e permissões"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(true); setIsEditing(false); form.reset({ nome: "", email: "", senha: "", perfilNome: "OPERADOR" }); }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-light px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brandGreen-500/30 transition-all hover:shadow-brandGreen-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Novo usuário
        </button>
      </div>

      {/* ── Create User Dialog ──────────────────────────────────────────────── */}
      <Dialog.Root
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) form.reset({ nome: "", email: "", senha: "", perfilNome: "OPERADOR" });
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 focus:outline-none">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg shadow-brandGreen-500/30">
                  <Plus className="h-5 w-5 text-white" />
                </span>
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">Novo usuário</Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500 dark:text-slate-400">
                    Preencha os dados para criar um novo usuário.
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <form
              onSubmit={form.handleSubmit((values) => createUsuario.mutate(values))}
              className="mt-2 grid gap-4 lg:grid-cols-2"
            >
              <Field
                label="Nome completo"
                error={form.formState.errors.nome?.message}
                {...form.register("nome")}
                placeholder="Ex: João Silva"
              />
              <Field
                label="Email"
                type="email"
                error={form.formState.errors.email?.message}
                {...form.register("email")}
                placeholder="usuario@empresa.com"
              />
              <Field
                label="Senha"
                type="password"
                error={form.formState.errors.senha?.message}
                {...form.register("senha")}
                placeholder="Mínimo 8 caracteres"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ADMIN", "OPERADOR", "AUDITOR"] as const).map((p) => {
                    const { icon: Icon, label } = perfilMeta(p);
                    return (
                      <label
                        key={p}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-xs font-bold transition-all has-[:checked]:border-brandGreen-500 has-[:checked]:bg-brandGreen-50 has-[:checked]:text-brandGreen-700 dark:has-[:checked]:bg-brandGreen-900/30 dark:dark:text-brandGreen-300"
                      >
                        <input type="radio" value={p} className="sr-only" {...form.register("perfilNome")} />
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); form.reset(); }}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-light px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brandGreen-500/30 hover:shadow-brandGreen-500/50 disabled:opacity-60"
                >
                  {isCreating ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Check className="h-4 w-4" /> Criar usuário</>}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <GlassCard hover glow="red">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Lista de usuários</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Busque por nome ou email.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                placeholder="Buscar..."
                className="min-w-[200px] rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-brandGreen-400 focus:ring-2 focus:ring-brandGreen-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-brandGreen-500 dark:focus:ring-brandGreen-900"
              />
            </div>
            <button
              type="button"
              onClick={() => setPage(1)}
              className="rounded-2xl bg-brandGreen-600 px-4 py-3 text-sm font-bold text-white hover:bg-brandGreen-700"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {["Nome", "Email", "Perfil", "Status", "Criado em", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {usuariosQuery.isLoading ? (
              <TableSkeleton />
            ) : usuariosQuery.error ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">Erro ao carregar usuários.</p>
                    <button
                      onClick={() => usuariosQuery.refetch()}
                      className="mt-2 text-xs text-brandGreen-600 hover:underline"
                    >
                      Tentar novamente
                    </button>
                  </td>
                </tr>
              </tbody>
            ) : usuariosQuery.data?.data.length ? (
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {usuariosQuery.data.data.map((user) => {
                  const { icon: ProfileIcon, label: perfilLabel, variant: perfilVariant } = perfilMeta(user.perfilNome);
                  return (
                    <tr
                      key={user.usuarioId}
                      className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brandGreen-light text-white text-xs font-bold shadow">
                            {user.nome.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{user.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="px-4 py-4">
                        <Badge variant={perfilVariant} size="sm" className="gap-1">
                          <ProfileIcon className="h-3 w-3" />
                          {perfilLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {user.ativo ? (
                          <Badge variant="success" size="sm" pulse>Ativo</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Inativo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(user.data_criacao).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-4">
                        <RowActions
                          user={user}
                          onView={() => handleViewUser(user)}
                          onEdit={() => handleEditUser(user)}
                          onDeactivate={() => handleDeactivateUser(user)}
                          onActivate={() => handleActivateUser(user)}
                          onDelete={() => handleDeleteUser(user)}
                          isDeleting={isDeleting}
                          isActivating={isActivating}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">Nenhum usuário encontrado.</p>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Página {usuariosQuery.data?.meta.page ?? page} de {totalPages} &mdash; {totalCount} registro{totalCount !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 rounded-2xl text-sm font-semibold transition-all ${
                      page === p
                        ? "bg-brandGreen-600 text-white shadow"
                        : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── View / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
            setIsEditing(false);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 focus:outline-none">
            {selectedUser && (
              <div>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brandGreen-light text-white text-base font-bold shadow-lg shadow-brandGreen-500/30">
                      {selectedUser.nome.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                        {isEditing ? "Editar usuário" : selectedUser.nome}
                      </Dialog.Title>
                      <Dialog.Description className="text-xs text-slate-500 dark:text-slate-400">
                        {isEditing ? "Atualize os dados e salve as alterações." : selectedUser.email}
                      </Dialog.Description>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {isEditing ? (
                  <form
                    onSubmit={editForm.handleSubmit((values) => {
                      if (selectedUser) updateUsuario.mutate({ usuarioId: selectedUser.usuarioId, values });
                    })}
                    className="mt-2 grid gap-4 lg:grid-cols-2"
                  >
                    <Field
                      label="Nome"
                      error={editForm.formState.errors.nome?.message}
                      {...editForm.register("nome")}
                    />
                    <Field
                      label="Email"
                      type="email"
                      error={editForm.formState.errors.email?.message}
                      {...editForm.register("email")}
                    />
                    <div className="space-y-2">
                      <Field
                        label="Senha (deixe em branco para não alterar)"
                        type="password"
                        error={editForm.formState.errors.senha?.message}
                        {...editForm.register("senha")}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["ADMIN", "OPERADOR", "AUDITOR"] as const).map((p) => {
                          const { icon: Icon, label } = perfilMeta(p);
                          return (
                            <label
                              key={p}
                              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 px-2 py-2.5 text-xs font-bold transition-all has-[:checked]:border-brandGreen-500 has-[:checked]:bg-brandGreen-50 has-[:checked]:text-brandGreen-700 dark:has-[:checked]:bg-brandGreen-900/30 dark:dark:text-brandGreen-300"
                            >
                              <input type="radio" value={p} className="sr-only" {...editForm.register("perfilNome")} />
                              <Icon className="h-3.5 w-3.5" />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Cancelar
                        </button>
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-light px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brandGreen-500/30 hover:shadow-brandGreen-500/50 disabled:opacity-60"
                      >
                        {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Check className="h-4 w-4" /> Salvar alterações</>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <DetailCard label="Nome" value={selectedUser.nome} />
                    <DetailCard label="Email" value={selectedUser.email} />
                    <DetailCard
                      label="Perfil"
                      value={perfilMeta(selectedUser.perfilNome).label}
                      badge={
                        <Badge variant={perfilMeta(selectedUser.perfilNome).variant} size="sm">
                          {perfilMeta(selectedUser.perfilNome).label}
                        </Badge>
                      }
                    />
                    <DetailCard
                      label="Status"
                      value={selectedUser.ativo ? "Ativo" : "Inativo"}
                      badge={
                        selectedUser.ativo ? (
                          <Badge variant="success" size="sm" pulse>Ativo</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Inativo</Badge>
                        )
                      }
                    />
                    <DetailCard
                      label="Criado em"
                      value={new Date(selectedUser.data_criacao).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    />
                    <DetailCard
                      label="Ações"
                      actions={
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditUser(selectedUser)}
                            className="inline-flex items-center gap-2 rounded-xl bg-brandGreen-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brandGreen-700"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </button>
                          {selectedUser.ativo ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivateUser(selectedUser)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
                            >
                              <UserX className="h-3.5 w-3.5" /> Inativar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleActivateUser(selectedUser)}
                              disabled={isActivating}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Ativar
                            </button>
                          )}
                          {!selectedUser.canDelete ? null : (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(selectedUser)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Excluir
                            </button>
                          )}
                        </div>
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Confirmation Dialog ───────────────────────────────────────────── */}
      <Dialog.Root
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,22rem)] -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 focus:outline-none">
            {confirmAction && (
              <div className="text-center">
                <span className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${
                  confirmAction.action === "delete" ? "bg-rose-100 dark:bg-rose-900/30" :
                  confirmAction.action === "activate" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                  "bg-amber-100 dark:bg-amber-900/30"
                }`}>
                  {confirmAction.action === "delete" ? <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" /> :
                   confirmAction.action === "activate" ? <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> :
                   <UserX className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                </span>
                <Dialog.Title className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  {confirmAction.action === "delete" ? "Excluir usuário?" :
                   confirmAction.action === "activate" ? "Ativar usuário?" :
                   "Inativar usuário?"}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {confirmAction.action === "delete" ? `Deseja excluir permanentemente ${confirmAction.user.nome}? Esta ação não pode ser desfeita.` :
                   confirmAction.action === "activate" ? `Deseja ativar o usuário ${confirmAction.user.nome}?` :
                   `Deseja inativar o usuário ${confirmAction.user.nome}?`}
                </Dialog.Description>
                <div className="mt-6 flex justify-center gap-3">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={confirmActionHandler}
                    disabled={isDeleting || isActivating}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60 ${
                      confirmAction.action === "delete" ? "bg-rose-600 hover:bg-rose-700" :
                      confirmAction.action === "activate" ? "bg-emerald-600 hover:bg-emerald-700" :
                      "bg-amber-600 hover:bg-amber-700"
                    }`}
                  >
                    {(isDeleting || isActivating) ? (
                      <><Loader2 className="h-4 w-4 animate-spin inline mr-1" /> Processando...</>
                    ) : confirmAction.action === "delete" ? "Excluir" :
                       confirmAction.action === "activate" ? "Ativar" : "Inativar"}
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition-all dark:bg-slate-800 dark:text-white ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-rose-500"
            : "border-slate-200 focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-100 dark:border-slate-700 dark:focus:border-brandGreen-500 dark:focus:ring-brandGreen-900"
        } ${className ?? ""}`}
        {...props}
      />
      {error ? <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
}

function DetailCard({
  label,
  value,
  badge,
  actions,
}: {
  label: string;
  value?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="mt-2">{badge ?? <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>}</div>
      {actions && <div className="mt-3">{actions}</div>}
    </div>
  );
}

function RowActions({
  user,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  isDeleting,
  isActivating,
}: {
  user: UsuarioItem;
  onView: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isActivating: boolean;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-brandGreen-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brandGreen-400"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="3" r="1.2" fill="currentColor" />
            <circle cx="7" cy="7" r="1.2" fill="currentColor" />
            <circle cx="7" cy="11" r="1.2" fill="currentColor" />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Item
            asChild
            onSelect={onView}
            className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <button type="button">
              <Eye className="h-4 w-4" /> Visualizar
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            asChild
            onSelect={onEdit}
            className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <button type="button">
              <Pencil className="h-4 w-4" /> Editar
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
          {user.ativo ? (
            <DropdownMenu.Item
              asChild
              onSelect={onDeactivate}
              disabled={isDeleting}
              className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
            >
              <button type="button">
                <UserX className="h-4 w-4" /> Inativar
              </button>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              asChild
              onSelect={onActivate}
              disabled={isActivating}
              className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            >
              <button type="button">
                <UserCheck className="h-4 w-4" /> Ativar
              </button>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            asChild
            onSelect={onDelete}
            disabled={!user.canDelete || isDeleting}
            className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <button type="button">
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}