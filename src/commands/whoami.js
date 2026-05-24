import {Command, Flags} from '@oclif/core'
import {ensureAccessToken} from '../lib/api-client.js'
import {fetchUserInfo} from '../lib/oauth.js'
import {readState, writeState} from '../lib/state.js'
import {outputJson, printReadable} from '../lib/output.js'

export default class Whoami extends Command {
  static description = 'Show the logged-in FleetFlow profile'

  static flags = {
    json: Flags.boolean({description: 'Output raw JSON'}),
  }

  async run() {
    const {flags} = await this.parse(Whoami)
    const state = await ensureAccessToken(this.config.configDir)
    const profile = await fetchUserInfo({host: state.host || 'fleetflow.io', accessToken: state.accessToken})
    await writeState(this.config.configDir, {...await readState(this.config.configDir), profile})
    if (flags.json) return outputJson(this, profile)
    printReadable(this, profile)
  }
}
