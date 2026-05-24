import {Command, Flags} from '@oclif/core'
import {randomUUID} from 'node:crypto'
import readline from 'node:readline/promises'
import {stdin as input, stdout as output} from 'node:process'
import {DEFAULT_CALLBACK_PORT, DEFAULT_HOST} from '../lib/constants.js'
import {buildLoginRequest, fetchUserInfo, openBrowser, waitForOAuthCallback} from '../lib/oauth.js'
import {mergeTokenState, normalizeOrganizations, writeState} from '../lib/state.js'

export default class Login extends Command {
  static description = 'Log in with FleetFlow browser OAuth'

  static flags = {
    host: Flags.string({description: 'FleetFlow host', default: DEFAULT_HOST, options: ['fleetflow.io', 'localhost']}),
    port: Flags.integer({description: 'Local OAuth callback port', default: DEFAULT_CALLBACK_PORT}),
    'no-open': Flags.boolean({description: 'Print the login URL instead of opening a browser'}),
  }

  async run() {
    const {flags} = await this.parse(Login)
    const stateNonce = randomUUID()
    const {sdk, verifier, url, redirectUri} = await buildLoginRequest({
      host: flags.host,
      port: flags.port,
      state: stateNonce,
    })

    const callback = waitForOAuthCallback({port: flags.port, expectedState: stateNonce})
    if (flags['no-open']) {
      this.log(`Open this URL to log in:\n${url}`)
    } else {
      await openBrowser(url)
      this.log('Opened FleetFlow in your browser. Waiting for login...')
    }

    const {code} = await callback
    if (!code) throw new Error('OAuth callback did not include a code')

    const tokens = await sdk.oauthExchangeCode({
      code,
      codeVerifier: verifier,
      redirectUri,
      clientId: sdk.oauth.clientId,
    })
    const profile = await fetchUserInfo({host: flags.host, accessToken: tokens.access_token})
    const organizations = normalizeOrganizations(profile)
    const selectedOrganization = await selectOrganization(organizations, this)

    const nextState = mergeTokenState({
      host: flags.host,
      profile,
      selectedOrganization,
    }, tokens)
    await writeState(this.config.configDir, nextState)
    this.log(`Logged in as ${profile.email || profile.uuid}`)
    if (selectedOrganization) this.log(`Selected organization: ${selectedOrganization.name || selectedOrganization.uuid}`)
  }
}

async function selectOrganization(organizations, command) {
  if (organizations.length === 0) return null
  if (organizations.length === 1 || !process.stdin.isTTY) return organizations[0]

  command.log('Select an organization:')
  organizations.forEach((org, index) => {
    command.log(`${index + 1}. ${org.name || org.uuid} (${org.uuid})`)
  })
  const rl = readline.createInterface({input, output})
  try {
    const answer = await rl.question('Organization number: ')
    const index = Number(answer) - 1
    return organizations[index] || organizations[0]
  } finally {
    rl.close()
  }
}
