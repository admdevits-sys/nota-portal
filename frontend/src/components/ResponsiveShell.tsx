import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  Grid,
  LogOut,
  UploadCloud,
  UserCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  User,
  ShieldCheck,
  ClipboardList,
  Key,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useState, useEffect, createContext, useContext } from "react";

interface SidebarContextValue {
  sidebarCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return { sidebarCollapsed: false };
  }
  return context;
}

const navItems = [
  { to: "/dashboard", label: "Resumo", icon: Grid, description: "Visão geral" },
  { to: "/dashboard/import", label: "Importar XML", icon: UploadCloud, description: "Carregar notas" },
  { to: "/dashboard/validation", label: "Validar XML", icon: ShieldCheck, description: "Validar com ADN" },
  { to: "/dashboard/notas", label: "Notas Fiscais", icon: FileText, description: "Consultar notas" },
  { to: "/dashboard/usuarios", label: "Usuários", icon: Users, description: "Gerenciar" },
  { to: "/dashboard/cadastros", label: "Cadastros", icon: Building2, description: "Cadastros" },
];

const adminNavItems = [
  { to: "/dashboard/logs", label: "Logs", icon: ClipboardList, description: "Logs do sistema" },
  { to: "/dashboard/permissoes", label: "Permissões", icon: Key, description: "Gerenciar permissões" },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-300 ${
    isActive
      ? "group bg-brandGreen-light text-white shadow-lg shadow-brandGreen-light/30 dark:bg-brandGreen-neon dark:text-white dark:shadow-brandGreen-neon/30"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white [&_.nav-icon]:text-brandGreen-light [&_.nav-icon]:dark:text-brandGreen-neon"
  }`;
}

export function ResponsiveShell() {
  const navigate = useNavigate();
  const perfilNome = localStorage.getItem("perfilNome") ?? "Usuário";
  const userEmail = localStorage.getItem("userEmail") ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Verificar se o usuário é admin ou auditor para mostrar item de logs
  const isAdminOuAuditor = perfilNome.toLowerCase() === "admin" || perfilNome.toLowerCase() === "auditor";

  // Filtrar itens do menu - remove "Usuários" para não-admin
  const filteredNavItems = navItems.filter(item => {
    if (item.to === "/dashboard/usuarios" && !isAdminOuAuditor) return false;
    return true;
  });

  // Load dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("perfilNome");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-64";
  const contentPadding = sidebarCollapsed ? "lg:pl-20" : "lg:pl-64";

  return (
    <div className="min-h-screen bg-[#F4F7F4] dark:bg-[#0A0A0A]">
      {/* Animated Background Orbs - Light Mode */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden hidden dark:block">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-brandGreen-neon/20 blur-3xl animate-pulse" />
        <div className="absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-brandRed-soft/15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-64 -left-64 h-[500px] w-[500px] rounded-full bg-brandGreen-neon/10 blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar - Desktop Fixed */}
        <aside className={`fixed left-0 top-0 z-40 hidden h-screen flex-col bg-white dark:bg-[#1A1A1A] lg:flex border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${sidebarWidth}`}>
          {/* Logo Area */}
          <div className={`flex items-center border-b border-slate-200 dark:border-slate-800 ${sidebarCollapsed ? "justify-center px-2 py-4" : "gap-3 px-4 py-4"}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brandGreen-light to-brandGreen-600 shadow-lg shadow-brandGreen-light/30 flex-shrink-0">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-brandGreen-light truncate">
                  Nota Portal
                </p>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  Portal NF
                </h1>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:scale-110 transition-transform"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-3">
            <p className={`mb-2 px-2 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ${sidebarCollapsed ? "text-center" : ""}`}>
              {sidebarCollapsed ? "•••" : "Menu"}
            </p>
            <nav className={`space-y-1 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={navLinkClass}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-all group-hover:scale-110 flex-shrink-0 ${isActive ? "bg-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                          <Icon className={`h-4 w-4 ${isActive ? "text-brandGreen-light" : ""}`} />
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{item.label}</p>
                            <p className={`text-[9px] ${isActive ? "text-white/70 dark:text-white/70" : "text-slate-500 dark:text-slate-400"}`}>{item.description}</p>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
              {isAdminOuAuditor && adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={navLinkClass}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-all group-hover:scale-110 flex-shrink-0 ${isActive ? "bg-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                          <Icon className={`h-4 w-4 ${isActive ? "text-brandGreen-light" : ""}`} />
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{item.label}</p>
                            <p className={`text-[9px] ${isActive ? "text-white/70 dark:text-white/70" : "text-slate-500 dark:text-slate-400"}`}>{item.description}</p>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Controls */}
          <div className={`border-t border-slate-200/50 dark:border-slate-700/50 ${sidebarCollapsed ? "p-2" : "p-3"}`}>
            {/* Dark/Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-3 w-full rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
              title={sidebarCollapsed ? (darkMode ? "Modo Claro" : "Modo Escuro") : undefined}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-light text-white shadow-lg flex-shrink-0">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {darkMode ? "Modo Escuro" : "Modo Claro"}
                </span>
              )}
            </button>

            {/* User Section */}
            <div className={`flex items-center gap-2 rounded-xl bg-slate-100 p-2.5 mt-2 dark:bg-slate-800 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <button onClick={() => navigate("/dashboard/perfil")} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brandGreen-light text-white shadow-lg flex-shrink-0">
                  <UserCircle className="h-5 w-5" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{perfilNome}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                  </div>
                )}
              </button>
              {!sidebarCollapsed && (
                <button onClick={handleLogout} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors dark:hover:bg-rose-500/20 flex-shrink-0">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 xl:px-6 dark:bg-[#1A1A1A] dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-brandGreen-light text-white shadow-lg">
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brandGreen-600">Nota Portal</p>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Portal NF</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark/Light Toggle for Mobile */}
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 sm:w-80 bg-white dark:bg-[#1A1A1A] p-4 space-y-4 overflow-y-auto border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between py-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brandGreen-light text-white">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{perfilNome}</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  </div>
                </div>
                <button onClick={toggleDarkMode} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  {darkMode ? <Sun className="h-5 w-5 text-slate-600" /> : <Moon className="h-5 w-5 text-slate-600" />}
                </button>
              </div>
              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                      {({ isActive }) => (
                        <>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-all flex-shrink-0 ${isActive ? "bg-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <Icon className={`h-5 w-5 ${isActive ? "text-brandGreen-light" : ""}`} />
                          </div>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
                {isAdminOuAuditor && adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                      {({ isActive }) => (
                        <>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-all flex-shrink-0 ${isActive ? "bg-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <Icon className={`h-5 w-5 ${isActive ? "text-brandGreen-light" : ""}`} />
                          </div>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <Badge variant={darkMode ? "info" : "warning"} className="w-full justify-center">
                  {darkMode ? "🌙 Modo Escuro Ativo" : "☀️ Modo Claro Ativo"}
                </Badge>
              </div>
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/20">
                <LogOut className="h-5 w-5" /> Sair
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <SidebarContext.Provider value={{ sidebarCollapsed }}>
          <div className={`flex-1 ${contentPadding} transition-all duration-300`}>
            {/* Top Bar */}
            <div className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 xl:px-6 dark:bg-[#1A1A1A] dark:border-slate-800 lg:top-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" placeholder="Buscar notas, clientes..." className="w-48 lg:w-64 rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2 text-sm outline-none focus:border-brandGreen-light focus:ring-2 focus:ring-brandGreen-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-brandGreen-neon dark:focus:ring-brandGreen-neon/30" />
              </div>
            </div>
          </div>

          {/* Page Content */}
            <main className="p-3 sm:p-4 xl:p-6 pt-16 sm:pt-20 lg:pt-6">
              <Outlet />
            </main>
          </div>
        </SidebarContext.Provider>
      </div>
    </div>
  );
}