import {afterEach, describe, expect, test} from 'bun:test'
import {mkdtemp, rm} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {ensureAccessToken} from '../src/lib/api-client.js'
import {readState, writeState} from '../src/lib/state.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('token refresh', () => {
  test('refreshes an expiring access token and persists it', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ff-cli-'))
    try {
      await writeState(dir, {
        host: 'localhost',
        accessToken: 'old',
        refreshToken: 'refresh',
        expiresAt: 1000,
      })
      globalThis.fetch = async (url, options) => {
        expect(String(url)).toBe('http://localhost:3104/oauth/token')
        expect(options.method).toBe('POST')
        return new Response(JSON.stringify({
          access_token: 'new',
          refresh_token: 'new-refresh',
          token_type: 'Bearer',
          expires_in: 300,
          scope: 'read write',
        }), {status: 200, headers: {'content-type': 'application/json'}})
      }

      const state = await ensureAccessToken(dir, 2000)
      expect(state.accessToken).toBe('new')
      expect((await readState(dir)).refreshToken).toBe('new-refresh')
    } finally {
      await rm(dir, {recursive: true, force: true})
    }
  })
})
