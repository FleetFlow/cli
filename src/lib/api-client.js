import {readFile} from 'node:fs/promises'
import path from 'node:path'
import FleetFlowSDK from '@repo/js-sdk'
import {CLI_CLIENT_ID, REFRESH_SKEW_MS} from './constants.js'
import {mergeTokenState, readState, resolveOrganization, writeState} from './state.js'

// Network errors where the request never reached FleetFlow (no connection was made), so even a POST can be sent
// again safely.
const NOT_SENT_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT', 'ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH',
])
// Network errors after the request may have arrived; only retried for requests that are safe to repeat.
const MAYBE_SENT_CODES = new Set([
  'ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'UND_ERR_SOCKET', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT',
])
const REPEATABLE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'])
export const RETRY_DELAYS_MS = [500, 1500, 4000]

/// The network error code of a failed fetch (Node puts it on `cause`), or undefined.
export function networkErrorCode(error) {
  return error?.cause?.code || error?.code
}

export function isRetryableNetworkError(error, method = 'GET') {
  const code = networkErrorCode(error)
  if (!code) return false
  if (NOT_SENT_CODES.has(code)) return true
  return MAYBE_SENT_CODES.has(code) && REPEATABLE_METHODS.has(String(method).toUpperCase())
}

/// Runs a request, trying again after a short wait when the connection failed (a timeout or reset, not an error
/// response from FleetFlow).
export async function withNetworkRetry(method, send, {delays = RETRY_DELAYS_MS, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), onRetry} = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await send()
    } catch (error) {
      if (attempt >= delays.length || !isRetryableNetworkError(error, method)) throw error
      onRetry?.(error, attempt + 1)
      await sleep(delays[attempt])
    }
  }
}

function logRetry(error, attempt) {
  process.stderr.write(`Connection problem (${networkErrorCode(error)}), retrying (${attempt}/${RETRY_DELAYS_MS.length})...\n`)
}

export function createClient(state, organization) {
  const headers = {}
  if (organization?.api_key) headers['X-Api-Key'] = organization.api_key
  const client = new FleetFlowSDK(state.host || 'fleetflow.io', headers, state.host === 'localhost')
  if (state.accessToken) client.setToken(state.accessToken)
  client.setOAuthConfig({
    clientId: CLI_CLIENT_ID,
    tokenEndpoint: `${client.getAuthBaseURL()}/api/better-auth/oauth2/token`,
  })
  return client
}

/// An organization API request through the SDK, retried on connection problems. (The SDK client is a Proxy, so
/// its `request` can't be wrapped in place.)
function sendRequest(client, method, pathValue, data) {
  return withNetworkRetry(method, () => client.request('organization', 'v1', method, pathValue, data), {onRetry: logRetry})
}

export async function ensureAccessToken(configDir, now = Date.now()) {
  const state = await readState(configDir)
  if (!state.accessToken) throw new Error('Not logged in. Run `ff login` first.')
  if (!state.refreshToken || (state.expiresAt && state.expiresAt - now > REFRESH_SKEW_MS)) {
    return state
  }

  const client = createClient(state)
  const refreshed = await client.oauthRefreshWithToken({
    refreshToken: state.refreshToken,
    clientId: CLI_CLIENT_ID,
  })
  const nextState = mergeTokenState(state, refreshed, now)
  await writeState(configDir, nextState)
  return nextState
}

export async function getOrganizationContext(configDir, flags = {}, env = process.env) {
  const state = await ensureAccessToken(configDir)
  const organization = resolveOrganization({
    explicitOrg: flags.org,
    envOrg: env.FLEETFLOW_ORG,
    selectedOrg: state.selectedOrganization,
    profile: state.profile,
  })
  if (!organization?.api_key) {
    throw new Error('No organization selected. Run `ff org select <uuid-or-name>` first.')
  }
  return {state, organization, client: createClient(state, organization)}
}

export function buildRequestHeaders({accessToken, apiKey}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Api-Key': apiKey,
  }
}

export function encodeQueryValue(value) {
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return value
}

export function buildListQuery(flags = {}) {
  const query = {}
  if (flags.page !== undefined) query.page = flags.page
  if (flags.query) query.query = flags.query
  if (flags['no-limit']) query.no_limit = true
  for (const item of flags.match || []) {
    const [key, ...rest] = item.split('=')
    if (!key || rest.length === 0) throw new Error(`Invalid --match value: ${item}`)
    query[key] = rest.join('=')
  }
  return query
}

export function parseScalar(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function assignPath(target, key, value) {
  const parts = key.split('.').filter(Boolean)
  let cursor = target
  for (const part of parts.slice(0, -1)) {
    cursor[part] ||= {}
    cursor = cursor[part]
  }
  cursor[parts.at(-1)] = value
}

export async function readStdinIfAvailable(stdin = process.stdin) {
  if (stdin.isTTY) return null
  const chunks = []
  for await (const chunk of stdin) chunks.push(chunk)
  const text = Buffer.concat(chunks.map((chunk) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))).toString('utf8').trim()
  return text || null
}

export async function parseInput(flags = {}, stdin = process.stdin) {
  const sourceCount = [flags.data, flags.file, flags.field?.length ? flags.field : null].filter(Boolean).length
  const stdinText = sourceCount === 0 ? await readStdinIfAvailable(stdin) : null
  const sources = sourceCount + (stdinText ? 1 : 0)
  if (sources === 0) return {}
  if (sources > 1) {
    throw new Error('Use only one of --data, --file, stdin, or repeated --field.')
  }

  if (flags.data) return JSON.parse(flags.data)
  if (flags.file) return JSON.parse(await readFile(flags.file, 'utf8'))
  if (stdinText) return JSON.parse(stdinText)

  const data = {}
  for (const field of flags.field || []) {
    const [key, ...rest] = field.split('=')
    if (!key || rest.length === 0) throw new Error(`Invalid --field value: ${field}`)
    assignPath(data, key, parseScalar(rest.join('=')))
  }
  return data
}

/// Parses repeated `--upload [field=]path` values. A bare path goes to the `file` field, which is what most upload
/// routes (firmwares, documents) read; image routes read `image` (also `--image`).
export function parseUploads(values = []) {
  return values.map((value) => {
    const match = /^([A-Za-z0-9_[\].-]+)=(.+)$/.exec(value)
    return match ? {field: match[1], path: match[2]} : {field: 'file', path: value}
  })
}

/// Sends the body as multipart form data when files are attached, with every body field as a form field
/// (objects as JSON). Without files the body stays JSON.
export async function maybeFormData(data, uploads = []) {
  const files = typeof uploads === 'string' ? [{field: 'image', path: uploads}] : (uploads || [])
  if (files.length === 0) return data
  const form = new FormData()
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined) continue
    form.append(key, typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value))
  }
  for (const file of files) {
    const bytes = await readFile(file.path)
    form.append(file.field, new Blob([bytes]), path.basename(file.path))
  }
  return form
}

export async function requestResource(client, resource, action, args, data) {
  const pathParts = []
  resource.segments.forEach((segment, index) => {
    pathParts.push(segment)
    if (index < resource.segments.length - 1) {
      pathParts.push(args[resource.parentArgs[index].name])
    }
  })
  if (['get', 'update', 'delete'].includes(action)) pathParts.push(args.uuid)
  const pathValue = pathParts.join('/')
  const method = {
    list: 'get',
    create: 'post',
    update: 'patch',
    get: 'get',
    delete: 'delete',
  }[action]
  return sendRequest(client, method.toUpperCase(), pathValue, data)
}

export async function requestResourceSchema(client, resource, action) {
	const pathParts = []
	let uuidIndex = 1

	resource.segments.forEach((segment, index) => {
		pathParts.push(segment)
		if (index < resource.segments.length - 1) {
			pathParts.push(`{uuid${uuidIndex}}`)
			uuidIndex++
		}
	})

	if (['get', 'update', 'delete'].includes(action)) {
		pathParts.push(`{uuid${uuidIndex}}`)
	}

	const method = {
		list: 'GET',
		create: 'POST',
		update: 'PATCH',
		get: 'GET',
		delete: 'DELETE',
	}[action]

	return requestWithoutBody(client, 'OPTIONS', `${pathParts.join('/')}?method=${method}`)
}

export async function requestRaw(client, method, rawPath, data) {
	const cleanPath = rawPath.replace(/^\/+/, '').replace(/^v1\/?/, '')
	if (method.toUpperCase() === 'OPTIONS') {
		return requestWithoutBody(client, 'OPTIONS', cleanPath)
	}
	return sendRequest(client, method.toUpperCase(), cleanPath, data)
}

async function requestWithoutBody(client, method, pathValue) {
	const headers = {...client.headers}
	if (!client.isBrowser && client.token) {
		headers.Authorization = `Bearer ${client.token}`
	}

	const response = await withNetworkRetry(method, () => fetch(`${client.buildApiRoot('organization')}/v1/${pathValue}`, {
		method,
		headers,
		body: null,
		credentials: client.isBrowser ? 'include' : 'omit',
	}), {onRetry: logRetry})

	if (response.status === 204) return undefined

	const contentType = response.headers.get('content-type') || ''
	const body = contentType.includes('application/json')
		? await response.json()
		: await response.text()

	if (response.status < 200 || response.status >= 300) {
		const message = typeof body === 'object'
			? body.message || body.error_description || body.error || 'Request failed'
			: body || 'Request failed'
		throw new Error(message)
	}

	return body?.data ?? body
}
