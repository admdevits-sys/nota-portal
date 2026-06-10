import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl font-semibold text-slate-900">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">A rota solicitada não existe ou foi removida.</p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-full bg-brandGreen-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brandGreen-600"
      >
        Ir para dashboard
      </Link>
    </div>
  );
}
