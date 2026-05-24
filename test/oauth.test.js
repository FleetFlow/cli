import {describe, expect, test} from 'bun:test'
import {buildLoginRequest, waitForOAuthCallback} from '../src/lib/oauth.js'
import {CLI_CLIENT_ID} from '../src/lib/constants.js'

describe('oauth helpers', () => {
  test('builds a PKCE authorization URL', async () => {
    const request = await buildLoginRequest({host: 'localhost', port: 17891, state: 'state-1'})
    const url = new URL(request.url)
    expect(url.origin).toBe('http://localhost:3104')
    expect(url.pathname).toBe('/oauth/authorize')
    expect(url.searchParams.get('client_id')).toBe(CLI_CLIENT_ID)
    expect(url.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:17891/callback')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('code_challenge')).toBeTruthy()
  })

  test('handles localhost callback with state validation', async () => {
    const port = 19091
    const callback = waitForOAuthCallback({port, expectedState: 'ok'})
    const res = await fetch(`http://127.0.0.1:${port}/callback?code=abc&state=ok`)
    expect(res.status).toBe(200)
    await expect(callback).resolves.toEqual({code: 'abc', state: 'ok'})
  })
})
