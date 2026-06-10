import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeProvider";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M12 7V5a4 4 0 0 0-8 0v2" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
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

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const { theme } = useTheme();

  return (
    <div className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
      theme === "dark"
        ? "border-white/10 bg-[#1A1A1A] hover:border-brandGreen-neon/30"
        : "border-slate-200 bg-white hover:border-brandGreen-light hover:shadow-brandGreen-light/10"
    }`}>
      <div className="relative">
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
          theme === "dark"
            ? "bg-brandGreen-neon/20"
            : "bg-brandGreen-50"
        }`}>
          {icon}
        </div>
        <h3 className={`mb-2 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
}

function TestimonialCard({ name, role, content }: TestimonialProps) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-2xl border p-6 ${
      theme === "dark"
        ? "border-white/10 bg-[#1A1A1A]"
        : "border-slate-200 bg-white"
    }`}>
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} className={`h-4 w-4 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />
        ))}
      </div>
      <p className={`mb-4 text-sm leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
        "{content}"
      </p>
      <div>
        <p className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{name}</p>
        <p className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>{role}</p>
      </div>
    </div>
  );
}

interface StatProps {
  value: string;
  label: string;
}

function StatCard({ value, label }: StatProps) {
  const { theme } = useTheme();

  return (
    <div className="text-center">
      <p className={`text-4xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
        {value}
      </p>
      <p className={`mt-1 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>{label}</p>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#F4F7F4] dark:bg-[#0A0A0A]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${
        theme === "dark"
          ? "border-white/10 bg-[#1A1A1A]"
          : "border-slate-200 bg-white"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-light shadow-lg shadow-brandGreen-light/30">
              <ShieldIcon className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Nota Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className={`text-sm font-medium transition-colors ${
                theme === "dark" ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/cadastro")}
              className="rounded-xl bg-brandGreen-light px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brandGreen-light/30 transition-all hover:scale-105 active:scale-[0.98]"
            >
              Começar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        {/* Background blobs - Dark Mode Neon */}
        <div className={`absolute inset-0 overflow-hidden ${theme === "dark" ? "block" : "hidden"}`}>
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brandGreen-neon/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brandGreen-neon/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brandGreen-neon/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Light Mode - Fundo off-white esverdeado sutil */}
        <div className={`absolute inset-0 overflow-hidden ${theme === "light" ? "block" : "hidden"}`}>
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brandGreen-light/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brandGreen-light/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Grid pattern */}
        <div className={`absolute inset-0 ${theme === "dark" ? "bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,130,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,130,0,0.03)_1px,transparent_1px)]"} bg-[size:64px_64px]`} />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm ${
              theme === "dark"
                ? "border-white/10 bg-brandGreen-neon/20 text-brandGreen-neon"
                : "border-brandGreen-200 bg-brandGreen-50 text-brandGreen-light"
            }`}>
              <span className="flex h-2 w-2 rounded-full bg-brandGreen-light animate-pulse" />
              Novo: Importação automática de NFSe
            </div>

            {/* Heading */}
            <h1 className={`mt-8 text-5xl font-bold tracking-tight md:text-7xl ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              Gestão de Notas fiscais{" "}
              <span className="text-brandGreen-light">
                simplificada
              </span>
            </h1>

            {/* Subheading */}
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}>
              Automatize a importação, organização e análise das suas notas fiscais de serviços.
              Economize tempo e reduza erros com nossa plataforma inteligente.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/cadastro")}
                className="flex items-center gap-2 rounded-xl bg-brandGreen-light px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brandGreen-light/30 transition-all hover:scale-105 active:scale-[0.98]"
              >
                Começar gratuitamente
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className={`flex items-center gap-2 rounded-xl border px-8 py-4 text-base font-medium transition-all active:scale-[0.98] ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                Ver demonstração
              </button>
            </div>

            {/* Trust badges */}
            <div className={`mt-12 flex items-center justify-center gap-8 text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className={`h-5 w-5 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className={`h-5 w-5 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />
                Configuração em 2 minutos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className={`h-5 w-5 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />
                Suporte 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className={`rounded-3xl p-8 md:p-12 ${
            theme === "dark"
              ? "border border-white/10 bg-[#1A1A1A]"
              : "border border-slate-200 bg-white"
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard value="10.000+" label="Notas processadas" />
              <StatCard value="500+" label="Empresas ativas" />
              <StatCard value="99.9%" label="Uptime garantido" />
              <StatCard value="4.9/5" label="Satisfação" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className={`text-3xl font-bold tracking-tight md:text-4xl ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              Tudo que você precisa
            </h2>
            <p className={`mx-auto mt-4 max-w-2xl text-lg ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}>
              Ferramentas completas para gerenciar suas notas fiscais de forma eficiente e segura.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<DocumentIcon className={`h-7 w-7 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />}
              title="Importação Inteligente"
              description="Importe XMLs de notas fiscais com apenas alguns cliques. Nossa IA extrai automaticamente todos os dados relevantes."
            />
            <FeatureCard
              icon={<ChartIcon className={`h-7 w-7 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />}
              title="Dashboard Analítico"
              description="Visualize gráficos e estatísticas em tempo real. Acompanhe seus gastos e receita de forma intuitiva."
            />
            <FeatureCard
              icon={<LockIcon className={`h-7 w-7 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />}
              title="Segurança Total"
              description="Seus dados protegidos com criptografia de ponta. Conformidade com LGPD garantida."
            />
            <FeatureCard
              icon={<UsersIcon className={`h-7 w-7 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />}
              title="Gestão de Usuários"
              description="Controle acessos com diferentes perfis. Audite todas as ações realizadas no sistema."
            />
            <FeatureCard
              icon={<ShieldIcon className={`h-7 w-7 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />}
              title="Validação Automática"
              description="Verificação automática de autenticidade das notas. Detecte problemas antes que eles ocorram."
            />
            <FeatureCard
              icon={<CheckCircleIcon className={`h-7 w-7 ${theme === "dark" ? "text-brandGreen-neon" : "text-brandGreen-light"}`} />}
              title="Relatórios Exportáveis"
              description="Gere relatórios detalhados em PDF, Excel e CSV. Compartilhe com sua equipe facilmente."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={`py-20 ${theme === "dark" ? "" : ""}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className={`text-3xl font-bold tracking-tight md:text-4xl ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              Como funciona
            </h2>
            <p className={`mx-auto mt-4 max-w-2xl text-lg ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}>
              Comece em minutos com três passos simples
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Crie sua conta", desc: "Cadastro rápido e gratuito em poucos segundos" },
              { step: "02", title: "Importe suas notas", desc: "Upload simples de arquivos XML ou integração via API" },
              { step: "03", title: "Gerencie tudo", desc: "Visualize, analise e exporte relatórios completos" },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold ${
                  theme === "dark"
                    ? "border border-white/10 bg-brandGreen-neon/20 text-brandGreen-neon"
                    : "border border-slate-200 bg-white text-brandGreen-light"
                }`}>
                  {item.step}
                </div>
                <h3 className={`mt-6 text-xl font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h3>
                <p className={`mt-2 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 ${theme === "dark" ? "" : ""}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className={`text-3xl font-bold tracking-tight md:text-4xl ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              O que dizem nossos clientes
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <TestimonialCard
              name="Marcos Silva"
              role="Diretor Financeiro, TechCorp"
              content="Reduzimos nosso tempo de processamento de notas em 85%. A importação automática é incredible."
            />
            <TestimonialCard
              name="Ana Rodrigues"
              role="Contadora, RB Assessoria"
              content="Finalmente uma ferramenta que entende as necessidades dos contadores. Simples e eficiente."
            />
            <TestimonialCard
              name="Pedro Santos"
              role="CEO, StartupXYZ"
              content="O dashboard nos ajuda a tomar decisões mais rápidas. Os relatórios são fantásticos."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className={`relative overflow-hidden rounded-3xl border p-12 md:p-16 ${
            theme === "dark"
              ? "border-white/10 bg-[#1A1A1A]"
              : "border-slate-200 bg-white"
          }`}>
            {/* Background blobs - Dark Mode Neon Green only */}
            <div className={`absolute inset-0 overflow-hidden ${theme === "dark" ? "block" : "hidden"}`}>
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brandGreen-neon/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brandGreen-neon/10 blur-3xl" />
            </div>

            <div className="relative z-10 text-center">
              <h2 className={`text-3xl font-bold tracking-tight md:text-5xl ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Pronto para começar?
              </h2>
              <p className={`mx-auto mt-4 max-w-xl text-lg ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                Junte-se a mais de 500 empresas que já economizam tempo com o Nota Portal.
                Comece seu período de teste gratuito hoje.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/cadastro")}
                  className="flex items-center gap-2 rounded-xl bg-brandGreen-light px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-[0.98]"
                >
                  Criar conta grátis
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 ${theme === "dark" ? "border-white/10" : "border-slate-200"}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-light shadow-lg shadow-brandGreen-light/30">
                <ShieldIcon className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Nota Portal
              </span>
            </div>
            <p className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
              © 2024 Nota Portal. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}