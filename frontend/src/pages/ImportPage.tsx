import * as Progress from "@radix-ui/react-progress";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { GlassCard } from "../components/ui/glass-card";
import { Badge } from "../components/ui/badge";
import { DocumentIcon } from "../components/ui/document-icon";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  RefreshCw,
  Clock,
  Sparkles,
  Info,
  Zap,
} from "lucide-react";

export function ImportPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Selecione até vários XMLs para importar."
  );

    const [progress, setProgress] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error" | "processing"
  >("idle");
  const [importResults, setImportResults] = useState<
    Array<{
      nomeArquivo: string;
      status: string;
      importacaoId?: string;
      message?: string;
    }>
  >([]);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (selectedFiles.length === 0) {
        throw new Error("Selecione ao menos um arquivo XML.");
      }

      const formData = new FormData();
      for (const f of selectedFiles) {
        formData.append("file", f);
      }


      const response = await api.post<{
        status: string;
        total: number;
        results: Array<{
          nomeArquivo: string;
          status: string;
          importacaoId?: string;
          message?: string;
        }>;
      }>("/import/xml", formData, {
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(
              Math.min(100, Math.round((event.loaded / event.total) * 100))
            );
          }
        },
      });

      return response.data;
    },
    onMutate: () => {
      setStatusMessage("Enviando XML...");
      setProgress(0);
      setImportStatus("processing");
      setImportResults([]);
    },
    onSuccess: async (data) => {
      setImportResults(data.results);
      const successCount = data.results.filter(
        (r) => r.status === "CONCLUIDO"
      ).length;
      const failCount = data.results.filter((r) => r.status === "FALHOU").length;

      if (failCount === 0) {
        setImportStatus("success");
        setStatusMessage(
          `${successCount} de ${data.total} XML(s) importado(s) com sucesso!`
        );
      } else {
        setImportStatus("error");
        setStatusMessage(
          `${successCount} sucesso(s), ${failCount} erro(s) em ${data.total} XML(s)`
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "importacoes", "statusCount"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "faturamento", "total"] });
    },
    onError: (err: any) => {
      setImportStatus("error");
      setImportResults([]);
      const message =
        err?.response?.data?.message || err?.message || "Falha ao importar XML.";
      setStatusMessage(message);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.name.endsWith(".xml")) {
setSelectedFiles([file]);

      setStatusMessage(`Arquivo pronto: ${file.name}`);
      setProgress(0);
      setImportStatus("idle");
    } else {
      setStatusMessage("Por favor, selecione um arquivo XML válido.");
      setImportStatus("error");
    }
  }, []);

  const statusIcon = {
    idle: <UploadCloud className="h-12 w-12 text-brandGreen-500" />,
    success: <CheckCircle className="h-12 w-12 text-brandGreen-500" />,
    error: <XCircle className="h-12 w-12 text-rose-500" />,
    processing: (
      <RefreshCw className="h-12 w-12 text-brandGreen-500 animate-spin" />
    ),
  };

  const statusColor = {
    idle: "border-slate-200 dark:border-slate-700",
    success:
      "border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-brandGreen-500/10",
    error:
      "border-rose-200 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-500/10",
    processing:
      "border-brandGreen-200 dark:border-brandGreen-700 bg-brandGreen-50/50 dark:bg-brandGreen-500/10",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-light shadow-lg shadow-brandGreen-500/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Upload de XML
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Importe NF-e e NFS-e de forma rápida e segura
              </p>
            </div>
          </div>
        </div>
        <Badge
          variant={
            importStatus === "success"
              ? "success"
              : importStatus === "error"
              ? "error"
              : importStatus === "processing"
              ? "info"
              : "default"
          }
          className="text-sm"
          pulse={importStatus === "processing"}
        >
          {importStatus === "success"
            ? "Importação Concluída"
            : importStatus === "error"
            ? "Erro na Importação"
            : importStatus === "processing"
            ? "Processando"
            : "Aguardando Arquivo"}
        </Badge>
      </div>

      {/* Main Upload Area */}
      <GlassCard
        className={`transition-all duration-300 ${statusColor[importStatus]}`}
      >
        <div className="flex flex-col items-center justify-center gap-8 lg:flex-row">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 lg:w-96 ${
              isDragging
                ? "border-brandGreen-500 bg-brandGreen-50/50 dark:bg-brandGreen-500/20"
                : selectedFiles.length > 0
                ? "border-emerald-400 bg-emerald-50/30 dark:bg-brandGreen-500/20"
                : "border-slate-300 bg-slate-50/50 hover:border-brandGreen-400 hover:bg-brandGreen-50/30 dark:border-slate-600 dark:bg-slate-800/30 dark:hover:border-brandGreen-500"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".xml,application/xml,text/xml"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []).filter((f) =>
                  f.name.toLowerCase().endsWith(".xml")
                );
                setSelectedFiles(files);
                setStatusMessage(
                  files.length
                    ? `Arquivos prontos: ${files.length} XML(s)`
                    : "Selecione um ou mais XMLs para importar."
                );
                setProgress(0);
                setImportStatus("idle");
              }}
            />

            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isDragging
                    ? "scale-110 bg-brandGreen-100 dark:bg-brandGreen-500/30"
                    : selectedFiles.length > 0
                    ? "scale-110 bg-emerald-100 dark:bg-brandGreen-500/30"
                  : "bg-slate-100 group-hover:scale-110 dark:bg-slate-700"
                }`}
              >
                {statusIcon[importStatus]}
              </div>

              <div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  {isDragging
                    ? "Solte o arquivo aqui!"
                    : selectedFiles.length > 0
                    ? selectedFiles[0]!.name

                    : "Arraste e solte ou clique para selecionar"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Suporta arquivos XML de NF-e e NFS-e
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="nfe" className="text-xs">
                    XML
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {(selectedFiles[0]!.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button & Progress */}
          <div className="flex w-full flex-col gap-6 lg:w-80">
            <button
              type="button"
              onClick={() => uploadMutation.mutate()}
disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              className={`flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold transition-all duration-300 ${
                selectedFiles.length === 0 || uploadMutation.isPending
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  : "bg-brandGreen-light text-white shadow-xl shadow-brandGreen-500/30 hover:scale-105 hover:shadow-2xl hover:shadow-brandGreen-500/40"
              }`}
            >
              {uploadMutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Iniciar Importação
                </>
              )}
            </button>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Progresso
                  </span>
                </div>
                <span className="text-sm font-bold text-brandGreen-600 dark:text-brandGreen-400">
                  {progress}%
                </span>
              </div>
              <Progress.Root
                value={progress}
                max={100}
                className="relative h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              >
                <Progress.Indicator
                  style={{ transform: `translateX(-${100 - progress}%)` }}
                  className="h-full rounded-full bg-brandGreen-light transition-all duration-500"
                />
              </Progress.Root>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {statusMessage}
              </p>
            </div>

            {/* Results per file */}
            {importResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Resultado da Importação
                </h4>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {importResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        result.status === "CONCLUIDO"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-brandGreen-500/10 dark:text-emerald-400"
                          : result.status === "PARCIAL"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                      }`}
                    >
                      {result.status === "CONCLUIDO" ? (
                        <CheckCircle className="h-4 w-4 shrink-0" />
                      ) : result.status === "PARCIAL" ? (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate font-medium">{result.nomeArquivo}</span>
                      <span className="text-xs opacity-75">— {result.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard hover glow="blue">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-brandGreen-500/20">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Validação por Hash SHA-256
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                O sistema valida duplicidade de XML usando hash SHA-256.
                Arquivos iguais recebem o mesmo registro de importação,
                garantindo consistência dos dados.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover glow="emerald">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-brandGreen-500/20">
              <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Processamento Seguro
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Caso haja erro estrutural, a importação é marcada como falhada
                e o processamento é cancelado com rollback dos registros,
                mantendo a integridade do banco de dados.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Supported Formats */}
      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-100 dark:bg-brandGreen-500/20">
            <Info className="h-5 w-5 text-brandGreen-600 dark:text-brandGreen-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Formatos Suportados
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30">
            <DocumentIcon type="nfe" size="lg" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">NF-e</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nota Fiscal Eletrônica de produtos
              </p>
            </div>
            <Badge variant="nfe" className="ml-auto">
              Ativo
            </Badge>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30">
            <DocumentIcon type="nfse" size="lg" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">NFSe</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nota Fiscal de Serviços Eletrônica
              </p>
            </div>
            <Badge variant="nfse" className="ml-auto">
              Ativo
            </Badge>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}