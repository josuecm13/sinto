/**
 * MODULE: Credentials Manager
 * Reads/writes ~/.sinto/credentials.json for JWT tokens and active cycle; requireAuth exits if not logged in.
 *
 * Exports: Credentials, saveCredentials, loadCredentials, requireAuth, getActiveCycleId, setActiveCycle
 * Depends on: fs, os, picocolors
 */
import fs from 'fs'
import path from 'path'
import os from 'os'

const SINTO_DIR = path.join(os.homedir(), '.sinto')
const CREDENTIALS_FILE = path.join(SINTO_DIR, 'credentials.json')

export interface Credentials {
  email: string
  accessToken: string
  refreshToken: string
  activeCycleId?: string
}

export function saveCredentials(creds: Credentials): void {
  if (!fs.existsSync(SINTO_DIR)) {
    fs.mkdirSync(SINTO_DIR, { mode: 0o700 })
  }
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), { mode: 0o600 })
}

export function loadCredentials(): Credentials | null {
  if (!fs.existsSync(CREDENTIALS_FILE)) return null
  try {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8')) as Credentials
  } catch {
    return null
  }
}

export function requireAuth(): Credentials {
  const creds = loadCredentials()
  if (!creds) {
    console.error('\n  Not logged in. Run: sinto login\n')
    process.exit(1)
  }
  return creds
}

export function setActiveCycle(cycleId: string): void {
  const creds = requireAuth()
  saveCredentials({ ...creds, activeCycleId: cycleId })
}

export function getActiveCycleId(creds: Credentials, override?: string): string {
  const id = override ?? creds.activeCycleId
  if (!id) {
    console.error('\n  No active cycle. Run: sinto cycle start  or  sinto cycle use <id>\n')
    process.exit(1)
  }
  return id
}
