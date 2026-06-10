import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().int().min(1).default(1)),
  pageSize: z
    .preprocess((value) => Number(value), z.number().int().min(1).max(200).default(20)),
  q: z.string().trim().max(255).optional(),
});

const perfilEnum = z.enum(["ADMIN", "OPERADOR", "AUDITOR"]);

export const usuarioCreateSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().max(150),
  senha: z.string().min(8).max(255),
  perfilNome: perfilEnum,
  ativo: z.boolean().default(true),
});

export const usuarioUpdateSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.string().email().max(150).optional(),
  senha: z.string().min(8).max(255).optional(),
  perfilNome: perfilEnum.optional(),
  ativo: z.boolean().optional(),
});

export const empresaCreateSchema = z.object({
  cnpj_cpf: z.string().trim().min(5).max(20),
  razao_social: z.string().trim().min(2).max(255),
  nome_fantasia: z.string().trim().max(255).optional(),
  endereco: z.string().trim().max(255).optional(),
  cidade: z.string().trim().max(100).optional(),
  uf: z.string().trim().length(2).optional(),
  telefone: z.string().trim().max(20).optional(),
  email: z.string().email().max(150).optional(),
});

export const empresaUpdateSchema = empresaCreateSchema.partial();

export const produtoCreateSchema = z.object({
  codigo: z.string().trim().min(1).max(100),
  descricao: z.string().trim().min(2).max(255),
  ncm: z.string().trim().max(20).optional(),
  cfop: z.string().trim().max(20).optional(),
  unidade: z.string().trim().max(20).optional(),
  preco: z.preprocess((value) => Number(value), z.number().nonnegative()),
});

export const produtoUpdateSchema = produtoCreateSchema.partial().extend({ codigo: z.string().trim().max(100).optional() });

export const servicoCreateSchema = z.object({
  codigo: z.string().trim().min(1).max(100),
  descricao: z.string().trim().min(2).max(255),
  preco: z.preprocess((value) => Number(value), z.number().nonnegative()),
  categoria: z.string().trim().max(100).optional(),
});

export const servicoUpdateSchema = servicoCreateSchema.partial().extend({ codigo: z.string().trim().max(100).optional() });

export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>;
export type EmpresaCreateInput = z.infer<typeof empresaCreateSchema>;
export type EmpresaUpdateInput = z.infer<typeof empresaUpdateSchema>;
export type ProdutoCreateInput = z.infer<typeof produtoCreateSchema>;
export type ProdutoUpdateInput = z.infer<typeof produtoUpdateSchema>;
export type ServicoCreateInput = z.infer<typeof servicoCreateSchema>;
export type ServicoUpdateInput = z.infer<typeof servicoUpdateSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;