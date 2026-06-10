import argon2 from "argon2";
import crypto from "node:crypto";
import { prisma } from "../db/prisma.js";
import { type RegisterInput, type LoginInput } from "../schemas/auth.schemas.js";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.usuarios.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    const err = new Error("EMAIL_ALREADY_EXISTS");
    (err as any).code = "EMAIL_ALREADY_EXISTS";
    throw err;
  }

  const perfil = await prisma.perfis.findUnique({
    where: { nome: input.perfilNome },
  });

  if (!perfil) {
    const err = new Error("PERFIL_INVALIDO");
    (err as any).code = "PERFIL_INVALIDO";
    throw err;
  }

  const senha_hash = await argon2.hash(input.senha);

  const user = await prisma.usuarios.create({
    data: {
      PK_usuario_id: crypto.randomUUID(),
      fk_perfil_id: perfil.PK_perfil_id,
      nome: input.nome,
      email: input.email,
      senha_hash,
      ativo: true,
    },
  });

  return {
    usuarioId: user.PK_usuario_id,
    nome: user.nome,
    email: user.email,
    perfilId: perfil.PK_perfil_id,
    perfilNome: perfil.nome,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.usuarios.findUnique({
    where: { email: input.email },
    include: { perfil: true },
  });

  if (!user || !user.ativo) {
    const err = new Error("INVALID_CREDENTIALS");
    (err as any).code = "INVALID_CREDENTIALS";
    throw err;
  }

  const ok = await argon2.verify(user.senha_hash, input.senha);
  if (!ok) {
    const err = new Error("INVALID_CREDENTIALS");
    (err as any).code = "INVALID_CREDENTIALS";
    throw err;
  }

  return {
    usuarioId: user.PK_usuario_id,
    perfilId: user.fk_perfil_id,
    email: user.email,
    perfilNome: user.perfil.nome,
  };
}

export async function getPerfis() {
  return prisma.perfis.findMany({
    orderBy: { PK_perfil_id: "asc" },
    select: {
      PK_perfil_id: true,
      nome: true,
      descricao: true,
    },
  });
}
