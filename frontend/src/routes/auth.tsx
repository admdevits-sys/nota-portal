import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../components/ThemeProvider";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1, "Informe a senha"),
});

type LoginInput = z.infer<typeof loginSchema>;

type AuthResponse = {
  token: string;
  perfilNome: string;
  email: string;
};

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M12 7V5a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
      <path d="M4.93 4.93l14.14 14.14" />
      <path d="M9 12a3 3 0 0 0 5.18 2.54" />
      <path d="M12.86 8.67C14.1 9.5 15.46 10.5 16 12c-.54 1.5-1.86 2.5-3.14 3.33" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      return api.post<AuthResponse>("/auth/login", input);
    },
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("perfilNome", res.data.perfilNome);
      localStorage.setItem("userEmail", res.data.email);
      navigate("/dashboard", { replace: true });
    },
  });

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${
      theme === "dark"
        ? "bg-[#0A0A0A]"
        : "bg-[#F4F7F4]"
    }`}>
      {/* Animated background blobs - dark mode only */}
      <div className={`absolute inset-0 overflow-hidden ${theme === "dark" ? "block" : "hidden"}`}>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brandGreen-neon/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brandGreen-neon/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brandGreen-neon/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Light mode subtle gradient orbs */}
      <div className={`absolute inset-0 overflow-hidden ${theme === "light" ? "block" : "hidden"}`}>
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brandGreen-light/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brandGreen-light/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-[linear-gradient(rgba(45,204,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,204,45,0.03)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,130,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,130,0,0.03)_1px,transparent_1px)]"} bg-[size:64px_64px]`} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        {/* Logo/Brand section */}
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/50"}`}>
            <ShieldIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Nota Portal</h1>
          <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Acesse sua conta para continuar</p>
        </div>

        {/* Main card */}
        <div className={`rounded-2xl border p-6 shadow-2xl ${
          theme === "dark"
            ? "border-white/10 bg-[#1A1A1A]"
            : "border-slate-200 bg-white"
        }`}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            {/* Email field */}
            <div className="space-y-1.5">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EmailIcon className={`h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                </div>
                <input
                  className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-brandGreen-500/50 focus:bg-white/10 focus:ring-brandGreen-500/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-brandGreen-light focus:bg-white focus:ring-brandGreen-light/30"
                  }`}
                  type="email"
                  {...form.register("email")}
                  placeholder="seuemail@dominio.com"
                />
              </div>
              {form.formState.errors.email?.message && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="mt-5 space-y-1.5">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Senha</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon className={`h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                </div>
                <input
                  className={`block w-full rounded-xl border py-3 pl-10 pr-12 text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-brandGreen-500/50 focus:bg-white/10 focus:ring-brandGreen-500/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-brandGreen-light focus:bg-white focus:ring-brandGreen-light/30"
                  }`}
                  type={showPassword ? "text" : "password"}
                  {...form.register("senha")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.senha?.message && (
                <p className="text-xs text-red-500">{form.formState.errors.senha.message}</p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="mt-3 flex justify-end">
              <Link to="/recuperar" className={`text-xs font-medium transition-colors ${theme === "dark" ? "text-brandGreen-400 hover:text-brandGreen-300" : "text-brandGreen-600 hover:text-brandGreen-700"}`}>
                Esqueci minha senha
              </Link>
            </div>

            {/* Error message */}
            {mutation.error && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-xs text-red-400">
                  {mutation.error instanceof Error ? mutation.error.message : "Falha ao fazer login."}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              disabled={mutation.isPending}
              type="submit"
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-light px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-[0.98] disabled:opacity-60 ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/40"}`}
            >
              {mutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className={`flex-1 border-t ${theme === "dark" ? "border-white/10" : "border-slate-200"}`} />
            <span className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>ou</span>
            <div className={`flex-1 border-t ${theme === "dark" ? "border-white/10" : "border-slate-200"}`} />
          </div>

          {/* Create account link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all active:scale-[0.98] ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              Criar nova conta
            </button>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="mt-6 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

const registerSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email().max(150),
  senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  perfilNome: z.enum(["ADMIN", "OPERADOR", "AUDITOR"]).default("OPERADOR"),
});

type RegisterInput = z.infer<typeof registerSchema>;

type PerfilItem = {
  PK_perfil_id: number;
  nome: string;
};

export function CadastroPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      perfilNome: "OPERADOR",
    },
  });

  const perfisQuery = useQuery({
    queryKey: ["perfis"],
    queryFn: async () => {
      const res = await api.get<{ data: PerfilItem[] }>("/auth/perfis");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const mutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      return api.post<AuthResponse>("/auth/register", input);
    },
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("perfilNome", res.data.perfilNome);
      localStorage.setItem("userEmail", res.data.email);
      navigate("/dashboard", { replace: true });
    },
  });

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${
      theme === "dark"
        ? "bg-[#0A0A0A]"
        : "bg-[#F4F7F4]"
    }`}>
      {/* Animated background blobs - dark mode only */}
      <div className={`absolute inset-0 overflow-hidden ${theme === "dark" ? "block" : "hidden"}`}>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brandGreen-neon/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brandGreen-neon/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brandGreen-neon/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Light mode subtle gradient orbs */}
      <div className={`absolute inset-0 overflow-hidden ${theme === "light" ? "block" : "hidden"}`}>
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brandGreen-light/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brandGreen-light/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-[linear-gradient(rgba(45,204,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,204,45,0.03)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,130,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,130,0,0.03)_1px,transparent_1px)]"} bg-[size:64px_64px]`} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        {/* Logo/Brand section */}
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/50"}`}>
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Criar conta</h1>
          <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Cadastre seus dados para começar</p>
        </div>

        {/* Main card */}
        <div className={`rounded-2xl border p-6 shadow-2xl ${
          theme === "dark"
            ? "border-white/10 bg-[#1A1A1A]"
            : "border-slate-200 bg-white"
        }`}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            {/* Nome field */}
            <div className="space-y-1.5">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Nome</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className={`h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                </div>
                <input
                  className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-brandGreen-neon/50 focus:bg-white/10 focus:ring-brandGreen-neon/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-brandGreen-light focus:bg-white focus:ring-brandGreen-light/30"
                  }`}
                  {...form.register("nome")}
                  placeholder="Seu nome completo"
                />
              </div>
              {form.formState.errors.nome?.message && (
                <p className="text-xs text-red-500">{form.formState.errors.nome.message}</p>
              )}
            </div>

            {/* Email field */}
            <div className="mt-5 space-y-1.5">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EmailIcon className={`h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                </div>
                <input
                  className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-brandGreen-neon/50 focus:bg-white/10 focus:ring-brandGreen-neon/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-brandGreen-light focus:bg-white focus:ring-brandGreen-light/30"
                  }`}
                  {...form.register("email")}
                  placeholder="seuemail@dominio.com"
                />
              </div>
              {form.formState.errors.email?.message && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Senha field */}
            <div className="mt-5 space-y-1.5">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Senha</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon className={`h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                </div>
                <input
                  className={`block w-full rounded-xl border py-3 pl-10 pr-12 text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-brandGreen-neon/50 focus:bg-white/10 focus:ring-brandGreen-neon/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-brandGreen-light focus:bg-white focus:ring-brandGreen-light/30"
                  }`}
                  type={showPassword ? "text" : "password"}
                  {...form.register("senha")}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.senha?.message && (
                <p className="text-xs text-red-500">{form.formState.errors.senha.message}</p>
              )}
            </div>

            {/* Perfil field */}
            <div className="mt-5 space-y-1.5">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Perfil</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <ShieldIcon className={`h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                </div>
                <select
                  className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white focus:border-brandGreen-neon/50 focus:bg-white/10 focus:ring-brandGreen-neon/20"
                      : "border-slate-200 bg-white text-slate-900 focus:border-brandGreen-light focus:bg-white focus:ring-brandGreen-light/30"
                  }`}
                  {...form.register("perfilNome")}
                  disabled={perfisQuery.isLoading || perfisQuery.isError}
                >
                  <option value="" className={theme === "dark" ? "bg-slate-900" : "bg-white"}>Selecione um perfil</option>
                  {perfisQuery.data?.map((perfil) => (
                    <option key={perfil.PK_perfil_id} value={perfil.nome} className={theme === "dark" ? "bg-slate-900" : "bg-white"}>
                      {perfil.nome}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className={`h-4 w-4 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
              {form.formState.errors.perfilNome?.message && (
                <p className="text-xs text-red-500">{form.formState.errors.perfilNome.message}</p>
              )}
              {perfisQuery.error && (
                <p className="text-xs text-red-500">Falha ao carregar perfis.</p>
              )}
            </div>

            {/* Error message */}
            {mutation.error && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-xs text-red-400">
                  {mutation.error instanceof Error ? mutation.error.message : "Falha ao criar conta."}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              disabled={mutation.isPending}
              type="submit"
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-light px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-[0.98] disabled:opacity-60 ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/40"}`}
            >
              {mutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className={`flex-1 border-t ${theme === "dark" ? "border-white/10" : "border-slate-200"}`} />
            <span className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>ou</span>
            <div className={`flex-1 border-t ${theme === "dark" ? "border-white/10" : "border-slate-200"}`} />
          </div>

          {/* Login link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all active:scale-[0.98] ${
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              <CheckIcon className="h-4 w-4" />
              Já tenho conta
            </button>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="mt-6 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

const recoverSchema = z.object({
  email: z.string().email(),
});

type RecoverInput = z.infer<typeof recoverSchema>;

export function RecuperarSenhaPage() {
  const { theme } = useTheme();
  const form = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (_input: RecoverInput) => {
      return { ok: true };
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  if (success) {
    return (
      <div className={`min-h-screen w-full relative overflow-hidden ${
        theme === "dark"
          ? "bg-[#0A0A0A]"
          : "bg-[#F4F7F4]"
      }`}>
        <div className={`absolute inset-0 overflow-hidden ${theme === "dark" ? "block" : "hidden"}`}>
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brandGreen-neon/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brandGreen-neon/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className={`absolute inset-0 ${theme === "dark" ? "bg-[linear-gradient(rgba(45,204,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,204,45,0.03)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,130,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,130,0,0.03)_1px,transparent_1px)]"} bg-[size:64px_64px]`} />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
          <div className="mb-8 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/50"}`}>
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h1 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Email enviado!</h1>
            <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Verifique sua caixa de entrada</p>
          </div>

          <div className={`rounded-2xl border p-6 shadow-2xl ${
            theme === "dark"
              ? "border-white/10 bg-[#1A1A1A]"
              : "border-slate-200 bg-white"
          }`}>
            <p className={`text-center text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
              Enviamos instruções para recuperação de senha para o email informado.
            </p>
            <p className={`mt-4 text-center text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
              Caso não encontre, verifique a pasta de spam.
            </p>

            <div className="mt-6">
              <Link
                to="/login"
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-light px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-[0.98] ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/40"}`}
              >
                Voltar ao login
              </Link>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${
      theme === "dark"
        ? "bg-[#0A0A0A]"
        : "bg-[#F4F7F4]"
    }`}>
      {/* Animated background blobs - dark mode only */}
      <div className={`absolute inset-0 overflow-hidden ${theme === "dark" ? "block" : "hidden"}`}>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brandGreen-neon/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brandGreen-neon/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brandGreen-neon/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Light mode subtle gradient orbs */}
      <div className={`absolute inset-0 overflow-hidden ${theme === "light" ? "block" : "hidden"}`}>
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brandGreen-light/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brandGreen-light/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-[linear-gradient(rgba(45,204,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,204,45,0.03)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,130,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,130,0,0.03)_1px,transparent_1px)]"} bg-[size:64px_64px]`} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        {/* Logo/Brand section */}
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/50"}`}>
            <LockIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Recuperar senha</h1>
          <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Informe seu email para receber instruções</p>
        </div>

        {/* Main card */}
        <div className={`rounded-2xl border p-6 shadow-2xl ${
          theme === "dark"
            ? "border-white/10 bg-[#1A1A1A]"
            : "border-slate-200 bg-white"
        }`}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            {/* Email field */}
            <div className="space-y-1.5">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EmailIcon className={`h-5 w-5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
                </div>
                <input
                  className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-brandGreen-500/50 focus:bg-white/10 focus:ring-brandGreen-500/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-brandGreen-light focus:bg-white focus:ring-brandGreen-light/30"
                  }`}
                  {...form.register("email")}
                  placeholder="seuemail@dominio.com"
                />
              </div>
              {form.formState.errors.email?.message && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              disabled={mutation.isPending}
              type="submit"
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-light px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-[0.98] disabled:opacity-60 ${theme === "dark" ? "shadow-brandGreen-neon/30" : "shadow-brandGreen-light/40"}`}
            >
              {mutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  Enviar instruções
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Info text */}
          <p className={`mt-4 text-center text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
            Enviaremos um email com instruções para redefinir sua senha.
          </p>
        </div>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-brandGreen-400 hover:text-brandGreen-300" : "text-brandGreen-600 hover:text-brandGreen-700"}`}
          >
            Voltar ao login
          </Link>
        </div>

        {/* Theme toggle */}
        <div className="mt-6 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
