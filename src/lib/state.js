import {mkdir, readFile, writeFile, rm} from 'node:fs/promises'
import path from 'node:path'

const STATE_FILE = 'session.json'

export function statePath(configDir) {
  return path.join(configDir, STATE_FILE)
}

export async function readState(configDir) {
  try {
    const raw = await readFile(statePath(configDir), 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw error
  }
}

export async function writeState(configDir, state) {
  await mkdir(configDir, {recursive: true, mode: 0o700})
  await writeFile(statePath(configDir), `${JSON.stringify(state, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  })
  return state
}

export async function clearState(configDir) {
  await rm(statePath(configDir), {force: true})
}

export function mergeTokenState(state, tokenResponse, now = Date.now()) {
  return {
    ...state,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token || state.refreshToken,
    tokenType: tokenResponse.token_type || 'Bearer',
    scope: tokenResponse.scope || state.scope,
    expiresAt: now + Number(tokenResponse.expires_in || 300) * 1000,
  }
}

export function normalizeOrganizations(profile) {
  const organizations = profile?.organizations || []
  if (Array.isArray(organizations)) return organizations
  return Object.values(organizations)
}

export function resolveOrganization({explicitOrg, envOrg, selectedOrg, profile}) {
  const requested = explicitOrg || envOrg || selectedOrg?.uuid || selectedOrg?.api_key
  const organizations = normalizeOrganizations(profile)

  if (!requested && selectedOrg?.api_key) return selectedOrg
  if (!requested) return null

  const match = organizations.find((org) => {
    return [org.uuid, org.api_key, org.name, org.slug]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase() === String(requested).toLowerCase())
  })

  if (match) return match

  if (selectedOrg && [selectedOrg.uuid, selectedOrg.api_key, selectedOrg.name, selectedOrg.slug].includes(requested)) {
    return selectedOrg
  }

  return {uuid: requested, api_key: requested, name: requested}
}
