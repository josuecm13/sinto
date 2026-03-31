import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../shared/utils/prisma'
import { redis } from '../../shared/utils/redis'
import { AppError } from '../../shared/errors/AppError'
import { env } from '../../config/env'
import type { RegisterInput, LoginInput } from './auth.schema'

const REFRESH_TOKEN_PREFIX = 'refresh:'
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

function refreshKey(userId: string, token: string) {
  return `${REFRESH_TOKEN_PREFIX}${userId}:${token}`
}

export async function registerUser(app: FastifyInstance, input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new AppError('Email already in use', 409, 'EMAIL_TAKEN')

  if (input.username) {
    const takenUsername = await prisma.user.findUnique({ where: { username: input.username } })
    if (takenUsername) throw new AppError('Username already taken', 409, 'USERNAME_TAKEN')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      username: input.username ?? null,
      passwordHash,
    },
    select: { id: true, email: true, name: true, username: true, createdAt: true },
  })

  const { accessToken, refreshToken } = await issueTokens(app, user.id)
  return { user, accessToken, refreshToken }
}

export async function loginUser(app: FastifyInstance, input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')

  const { accessToken, refreshToken } = await issueTokens(app, user.id)
  return {
    user: { id: user.id, email: user.email, name: user.name, username: user.username },
    accessToken,
    refreshToken,
  }
}

export async function refreshTokens(app: FastifyInstance, token: string) {
  let payload: { sub: string; type: string }
  try {
    payload = app.jwt.verify(token) as { sub: string; type: string }
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN')
  }

  if (payload.type !== 'refresh') {
    throw new AppError('Invalid token type', 401, 'INVALID_TOKEN')
  }

  const key = refreshKey(payload.sub, token)
  const stored = await redis.get(key)
  if (!stored) throw new AppError('Refresh token expired or revoked', 401, 'TOKEN_REVOKED')

  // Rotate: delete old, issue new
  await redis.del(key)
  const { accessToken, refreshToken } = await issueTokens(app, payload.sub)
  return { accessToken, refreshToken }
}

export async function logoutUser(app: FastifyInstance, token: string) {
  let payload: { sub: string; type: string }
  try {
    payload = app.jwt.verify(token) as { sub: string; type: string }
  } catch {
    return // already expired, nothing to revoke
  }

  if (payload.type === 'refresh') {
    await redis.del(refreshKey(payload.sub, token))
  }
}

async function issueTokens(app: FastifyInstance, userId: string) {
  const accessToken = app.jwt.sign(
    { sub: userId, type: 'access' },
    { expiresIn: env.JWT_EXPIRY },
  )
  const refreshToken = app.jwt.sign(
    { sub: userId, type: 'refresh' },
    { expiresIn: env.JWT_REFRESH_EXPIRY },
  )

  await redis.set(refreshKey(userId, refreshToken), '1', 'EX', REFRESH_TTL_SECONDS)
  return { accessToken, refreshToken }
}
