import {Command, Flags} from '@oclif/core'
import {ensureAccessToken} from '../../lib/api-client.js'
import {outputJson, printReadable} from '../../lib/output.js'

export default class OrgCurrent extends Command {
  static description = 'Show the selected organization'

  static flags = {
    json: Flags.boolean({description: 'Output raw JSON'}),
  }

  async run() {
    const {flags} = await this.parse(OrgCurrent)
    const state = await ensureAccessToken(this.config.configDir)
    if (!state.selectedOrganization) throw new Error('No organization selected. Run `ff org select <uuid-or-name>` first.')
    if (flags.json) return outputJson(this, state.selectedOrganization)
    printReadable(this, state.selectedOrganization)
  }
}
