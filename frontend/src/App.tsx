import { Navigate, Route, Routes } from "react-router-dom";
import { CadastroPage, LoginPage, RecuperarSenhaPage } from "./routes/auth";
import { LandingPage } from "./routes/LandingPage";
import { RequireAuth } from "./routes/protected";
import { ResponsiveShell } from "./components/ResponsiveShell";
import { DashboardPage } from "./pages/DashboardPage";
import { ImportPage } from "./pages/ImportPage";
import { ValidationPage } from "./pages/ValidationPage";
import { NotasPage } from "./pages/NotasPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import { CadastrosPage } from "./pages/CadastrosPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LogsPage } from "./pages/LogsPage";
import { PermissoesPage } from "./pages/PermissoesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/recuperar" element={<RecuperarSenhaPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <ResponsiveShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="notas" element={<NotasPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="cadastros" element={<CadastrosPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="permissoes" element={<PermissoesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}