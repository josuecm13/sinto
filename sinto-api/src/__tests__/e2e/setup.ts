import { execSync } from 'child_process'
import net from 'net'

export async function setupTestEnvironment() {
  // Start test containers
  try {
    execSync('docker compose -f docker-compose.test.yml up -d', { stdio: 'inherit' })
  } catch (err) {
    throw new Error('Failed to start test containers with docker compose')
  }

  // Wait for services to be available
  await waitForPort('127.0.0.1', 5434, 30000)
  await waitForPort('127.0.0.1', 6380, 30000)

  // Set environment variables required by the app before importing
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://sinto_test:sinto_test_pass@127.0.0.1:5434/sinto_test_db?schema=public'
  process.env.REDIS_URL = 'redis://127.0.0.1:6380'
  process.env.JWT_SECRET = 'test_secret_very_long_123456'

  // Ensure Prisma schema is pushed
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    execSync('npx prisma generate', { stdio: 'inherit' })
  } catch (err) {
    throw new Error('Prisma setup failed: ' + String(err))
  }

  // Import and build the app after env is configured
  const { buildApp } = await import('../../app')
  const app = buildApp()
  await app.ready()

  return {
    app,
    async stop() {
      try {
        await app.close()
      } catch (err) {
        // ignore
      }
      try {
        execSync('docker compose -f docker-compose.test.yml down -v', { stdio: 'inherit' })
      } catch (err) {
        // ignore
      }
    },
  }
}

function waitForPort(host: string, port: number, timeout = 30000) {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now()
    const tryConnect = () => {
      const s = net.createConnection({ host, port }, () => {
        s.end()
        resolve()
      })
      s.on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for port ' + port))
        setTimeout(tryConnect, 500)
      })
    }
    tryConnect()
  })
}
