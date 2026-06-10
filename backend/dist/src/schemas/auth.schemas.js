import { z } from "zod";
export const registerSchema = z.object({
    nome: z.string().min(2).max(100),
    email: z.string().email().max(150),
    senha: z.string().min(8).max(255),
    perfilNome: z.enum(["ADMIN", "OPERADOR", "AUDITOR"]).default("OPERADOR"),
});
export const loginSchema = z.object({
    email: z.string().email().max(150),
    senha: z.string().min(1).max(255),
});
