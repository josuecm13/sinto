/**
 * MODULE: Prisma client
 * Singleton PrismaClient using the pg driver adapter. Import `prisma` everywhere DB access is needed.
 *
 * Exports: prisma
 * Depends on: @prisma/client, @prisma/adapter-pg, DATABASE_URL
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
