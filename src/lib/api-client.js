import {readFile} from 'node:fs/promises'
import path from 'node:path'
import FleetFlowSDK from '@repo/js-sdk'
import {CLI_CLIENT_ID, REFRESH_SKEW_MS} from './constants.js'
import {mergeTokenState, readState, resolveOrganization, writeState} from './state.js'

export function createClient(state, organization) {
  const headers = {}
  if (organization?.api_key) headers['X-Api-Key'] = organization.api_key
  const client = new FleetFlowSDK(state.host || 'fleetflow.io', headers, state.host === 'localhost')
  if (state.accessToken) client.setToken(state.accessToken)
  client.setOAuthConfig({clientId: CLI_CLIENT_ID})
  return client
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

export async function maybeFormData(data, imagePath) {
  if (!imagePath) return data
  const form = new FormData()
  for (const [key, value] of Object.entries(data || {})) {
    form.append(key, typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value))
  }
  const bytes = await readFile(imagePath)
  form.append('image', new Blob([bytes]), path.basename(imagePath))
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
  return client.request('organization', 'v1', method.toUpperCase(), pathValue, data)
}

export async function requestRaw(client, method, rawPath, data) {
  const cleanPath = rawPath.replace(/^\/+/, '').replace(/^v1\/?/, '')
  return client.request('organization', 'v1', method.toUpperCase(), cleanPath, data)
}
