import {Command} from '@oclif/core'
import {clearState} from '../lib/state.js'

export default class Logout extends Command {
  static description = 'Clear the stored FleetFlow CLI session'

  async run() {
    await clearState(this.config.configDir)
    this.log('Logged out')
  }
}
