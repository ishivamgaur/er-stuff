import { createHmac, timingSafeEqual } from "node:crypto"

const ADMIN_PASSWORD_ENV = "ADMIN_PASSWORD"
const SESSION_SECRET_ENV = "ADMIN_SESSION_SECRET"
export const ADMIN_COOKIE_NAME = "devhub_admin"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

const readRequired = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const sign = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(payload).digest("base64url")

const buildSessionToken = (issuedAt: number, secret: string): string => {
  const payload = String(issuedAt)
  return `${payload}.${sign(payload, secret)}`
}

export const verifySessionToken = (token: string, secret: string): boolean => {
  const separatorIndex = token.lastIndexOf(".")
  if (separatorIndex <= 0) return false

  const payload = token.slice(0, separatorIndex)
  const signature = token.slice(separatorIndex + 1)
  const expected = sign(payload, secret)

  const receivedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (receivedBuffer.length !== expectedBuffer.length) return false

  if (!timingSafeEqual(receivedBuffer, expectedBuffer)) return false

  const issuedAt = Number(payload)
  if (!Number.isFinite(issuedAt)) return false

  return Date.now() - issuedAt < SESSION_MAX_AGE_SECONDS * 1000
}

export const isValidAdminPassword = (candidate: string): boolean => {
  const expected = process.env[ADMIN_PASSWORD_ENV]
  if (!expected) return false

  const receivedBuffer = Buffer.from(candidate)
  const expectedBuffer = Buffer.from(expected)
  if (receivedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(receivedBuffer, expectedBuffer)
}

export const createAdminSession = (): { name: string; value: string; maxAge: number } => {
  const secret = readRequired(SESSION_SECRET_ENV)
  const issuedAt = Date.now()

  return {
    name: ADMIN_COOKIE_NAME,
    value: buildSessionToken(issuedAt, secret),
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

export const isAdminSessionValid = (token: string | undefined): boolean => {
  if (!token) return false

  const secret = process.env[SESSION_SECRET_ENV]
  if (!secret) return false

  return verifySessionToken(token, secret)
}

export const clearAdminSession = (): { name: string; value: string; maxAge: number } => ({
  name: ADMIN_COOKIE_NAME,
  value: "",
  maxAge: 0,
})
