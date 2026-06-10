import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Key,
} from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const passwordSchema = z.object({
  senhaAtual: z.string().min(6, "Mínimo 6 caracteres"),
  novaSenha: z.string().min(6, "Mínimo 6 caracteres"),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type EmailInput = z.infer<typeof emailSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const [showSenha, setShowSenha] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
  });

  const senhaForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (values: EmailInput) => {
      const res = await api.put("/auth/profile/email", values);
      return res.data;
    },
    onSuccess: (data) => {
      emailForm.reset();
      localStorage.setItem("userEmail", data.email);
      setSuccessMessage("E-mail atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const updateSenhaMutation = useMutation({
    mutationFn: async (values: PasswordInput) => {
      const res = await api.put("/auth/profile/senha", {
        senhaAtual: values.senhaAtual,
        novaSenha: values.novaSenha,
      });
      return res.data;
    },
    onSuccess: () => {
      senhaForm.reset();
      setSuccessMessage("Senha alterada com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const userEmail = localStorage.getItem("userEmail") ?? "";
  const perfilNome = localStorage.getItem("perfilNome") ?? "Usuário";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brandGreen-500 to-brandGreen-600 shadow-lg shadow-brandGreen-500/30">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Meu Perfil
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>
        {successMessage && (
          <Badge variant="success" size="lg" className="animate-pulse">
            <CheckCircle className="h-4 w-4" /> {successMessage}
          </Badge>
        )}
      </div>

      {/* User Info Card */}
      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brandGreen-500 to-brandGreen-600 shadow-xl">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {perfilNome}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {userEmail}
            </p>
          </div>
          <Badge variant="info" className="ml-auto hidden sm:inline-flex">
            <Shield className="h-3 w-3" /> Administrador
          </Badge>
        </div>

        <div className="rounded-2xl bg-brandGreen-50 p-4 dark:bg-brandGreen-neon/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-brandGreen-600 dark:text-brandGreen-400" />
            <p className="text-sm text-brandGreen-700 dark:text-brandGreen-300">
              Mantenha suas informações atualizadas para garantir a segurança da sua conta.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Update Email */}
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-brandGreen-500 to-brandGreen-600 text-white shadow-lg">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Alterar E-mail
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Atualize seu endereço de e-mail
              </p>
            </div>
          </div>

          <form
            onSubmit={emailForm.handleSubmit((values) => updateEmailMutation.mutate(values))}
            className="space-y-4"
          >
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" />
                E-mail atual
              </span>
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" />
                Novo E-mail
              </span>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-brandGreen-500"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-rose-600">{emailForm.formState.errors.email.message}</p>
              )}
            </label>

            <button
              type="submit"
              disabled={updateEmailMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brandGreen-500/30 transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateEmailMutation.isPending ? (
                <>
                  <span className="animate-spin">⟳</span> Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Atualizar E-mail
                </>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Update Password */}
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-brandGreen-500 to-brandGreen-600 text-white shadow-lg">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Alterar Senha
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Atualize sua senha de acesso
              </p>
            </div>
          </div>

          <form
            onSubmit={senhaForm.handleSubmit((values) => updateSenhaMutation.mutate(values))}
            className="space-y-4"
          >
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <Key className="h-4 w-4" />
                Senha Atual
              </span>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 text-sm outline-none focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-brandGreen-500"
                  {...senhaForm.register("senhaAtual")}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {senhaForm.formState.errors.senhaAtual && (
                <p className="text-xs text-rose-600">{senhaForm.formState.errors.senhaAtual.message}</p>
              )}
            </label>

            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <Lock className="h-4 w-4" />
                Nova Senha
              </span>
              <div className="relative">
                <input
                  type={showNovaSenha ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 text-sm outline-none focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-brandGreen-500"
                  {...senhaForm.register("novaSenha")}
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNovaSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {senhaForm.formState.errors.novaSenha && (
                <p className="text-xs text-rose-600">{senhaForm.formState.errors.novaSenha.message}</p>
              )}
            </label>

            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <Lock className="h-4 w-4" />
                Confirmar Nova Senha
              </span>
              <div className="relative">
                <input
                  type={showConfirmar ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 text-sm outline-none focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-brandGreen-500"
                  {...senhaForm.register("confirmarSenha")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {senhaForm.formState.errors.confirmarSenha && (
                <p className="text-xs text-rose-600">{senhaForm.formState.errors.confirmarSenha.message}</p>
              )}
            </label>

            <button
              type="submit"
              disabled={updateSenhaMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateSenhaMutation.isPending ? (
                <>
                  <span className="animate-spin">⟳</span> Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Alterar Senha
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </div>

      {/* Security Info */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-brandGreen-600 dark:text-brandGreen-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Dicas de Segurança
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-800/50">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-100 text-brandGreen-600 dark:bg-brandGreen-500/20 dark:text-brandGreen-400">
              <Lock className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white">Senha Forte</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Use no mínimo 8 caracteres com letras, números e símbolos.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-800/50">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-100 text-brandGreen-600 dark:bg-brandGreen-500/20 dark:text-brandGreen-400">
              <Mail className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white">E-mail Válido</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Mantenha um e-mail válido para recuperação de conta.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-800/50">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Key className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white">Privacidade</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Nunca compartilhe sua senha com terceiros.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}