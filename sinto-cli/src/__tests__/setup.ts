import nock from 'nock'
import { describe } from 'vitest'

// Use node-fetch so nock can intercept HTTP requests made by fetch
// We avoid importing node-fetch at module evaluation time so tests can opt-in
export function useNodeFetchForNock(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch')
  // @ts-ignore
  globalThis.fetch = nodeFetch
}

export function setupNock(): void {
  // Ensure no real network calls are made during tests
  nock.disableNetConnect()
}

export function teardownNock(): void {
  nock.cleanAll()
  nock.enableNetConnect()
}

// Dummy describe to avoid "No test suite found" when Vitest treats this as a test file
describe('test setup', () => {})
