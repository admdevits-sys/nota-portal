// Converte BigInt para string em objetos/arrays recursivamente (necessário para Prisma + JSON)
export function serializeBigInt(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map(serializeBigInt);
    }
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = serializeBigInt(v);
    }
    return result;
  }
  return value;
}

// Wrapper para JSON.stringify que suporta BigInt
export function jsonStringify(data: unknown): string {
  return JSON.stringify(serializeBigInt(data));
}
