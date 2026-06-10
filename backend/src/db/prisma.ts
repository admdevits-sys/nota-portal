import { PrismaClient } from "@prisma/client";
import { prisma as prismaSingleton } from "../../prisma/prisma.config.js";

export const prisma: PrismaClient = prismaSingleton;
