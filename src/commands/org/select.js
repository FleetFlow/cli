import {Args, Command} from '@oclif/core'
import {ensureAccessToken} from '../../lib/api-client.js'
import {normalizeOrganizations, writeState} from '../../lib/state.js'

export default class OrgSelect extends Command {
  static description = 'Select the organization used by organization API commands'

  static args = {
    selector: Args.string({description: 'Organization UUID, API key, name, or slug', required: true}),
  }

  async run() {
    const {args} = await this.parse(OrgSelect)
    const state = await ensureAccessToken(this.config.configDir)
    const organizations = normalizeOrganizations(state.profile)
    const selector = args.selector.toLowerCase()
    const organization = organizations.find((org) => {
      return [org.uuid, org.api_key, org.name, org.slug].filter(Boolean).some((value) => String(value).toLowerCase() === selector)
    })
    if (!organization) throw new Error(`Organization not found: ${args.selector}`)
    await writeState(this.config.configDir, {...state, selectedOrganization: organization})
    this.log(`Selected organization: ${organization.name || organization.uuid}`)
  }
}
