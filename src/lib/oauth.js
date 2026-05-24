import http from 'node:http'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import FleetFlowSDK from '@repo/js-sdk'
import {CLI_CLIENT_ID, CLI_SCOPES, DEFAULT_CALLBACK_PORT} from './constants.js'

const execFileAsync = promisify(execFile)

export function createSdk(host, headers = {}) {
  return new FleetFlowSDK(host, headers, host === 'localhost')
}

export function redirectUriForPort(port = DEFAULT_CALLBACK_PORT, host = '127.0.0.1') {
  return `http://${host}:${port}/callback`
}

export async function buildLoginRequest({host, port, state, prompt} = {}) {
  const sdk = createSdk(host)
  sdk.setOAuthConfig({
    clientId: CLI_CLIENT_ID,
    redirectUri: redirectUriForPort(port),
    scopes: CLI_SCOPES,
  })
  const {verifier, challenge} = await sdk.generatePkcePair()
  const url = sdk.buildOAuthAuthorizeUrl({
    clientId: CLI_CLIENT_ID,
    redirectUri: redirectUriForPort(port),
    scope: CLI_SCOPES,
    codeChallenge: challenge,
    state,
    prompt,
  })
  return {sdk, verifier, challenge, url, redirectUri: redirectUriForPort(port)}
}

export async function openBrowser(url) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  await execFileAsync(command, args)
}

export function waitForOAuthCallback({port, expectedState}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`)
      if (requestUrl.pathname !== '/callback') {
        res.writeHead(404, {'content-type': 'text/plain'})
        res.end('Not found')
        return
      }

      const error = requestUrl.searchParams.get('error')
      if (error) {
        res.writeHead(400, {'content-type': 'text/html'})
        res.end('<h1>FleetFlow CLI login failed</h1><p>You can close this tab.</p>')
        server.close()
        reject(new Error(requestUrl.searchParams.get('error_description') || error))
        return
      }

      const state = requestUrl.searchParams.get('state')
      if (expectedState && state !== expectedState) {
        res.writeHead(400, {'content-type': 'text/html'})
        res.end('<h1>FleetFlow CLI login failed</h1><p>State mismatch. You can close this tab.</p>')
        server.close()
        reject(new Error('OAuth state mismatch'))
        return
      }

      const code = requestUrl.searchParams.get('code')
      res.writeHead(200, {'content-type': 'text/html'})
      res.end('<h1>FleetFlow CLI login complete</h1><p>You can close this tab and return to the terminal.</p>')
      server.close()
      resolve({code, state})
    })

    server.on('error', reject)
    server.listen(port, '127.0.0.1')
  })
}

export async function fetchUserInfo({host, accessToken}) {
  const sdk = createSdk(host)
  const res = await fetch(`${sdk.getAuthBaseURL()}/api/oauth/userinfo`, {
    headers: {Authorization: `Bearer ${accessToken}`},
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load FleetFlow profile')
  }
  return data?.data || data
}
