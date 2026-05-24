import {Command, Flags} from '@oclif/core'
import {ensureAccessToken} from '../lib/api-client.js'
import {normalizeOrganizations} from '../lib/state.js'
import {outputJson, printReadable} from '../lib/output.js'

export default class Orgs extends Command {
  static description = 'List organizations available to the logged-in profile'

  static flags = {
    json: Flags.boolean({description: 'Output raw JSON'}),
  }

  async run() {
    const {flags} = await this.parse(Orgs)
    const state = await ensureAccessToken(this.config.configDir)
    const organizations = normalizeOrganizations(state.profile)
    if (flags.json) return outputJson(this, organizations)
    printReadable(this, organizations)
  }
}
