import {Args, Command, Flags} from '@oclif/core'
import {getOrganizationContext, parseInput, requestRaw} from '../lib/api-client.js'
import {outputJson, printReadable} from '../lib/output.js'

export default class Api extends Command {
  static description = 'Call an organization API endpoint directly'

  static args = {
    method: Args.string({description: 'HTTP method', required: true, options: ['get', 'post', 'patch', 'delete', 'options']}),
    path: Args.string({description: 'Path below /v1, or a /v1/... path', required: true}),
  }

  static flags = {
    data: Flags.string({description: 'JSON request body'}),
    file: Flags.file({description: 'Read JSON request body from a file'}),
    json: Flags.boolean({description: 'Output raw JSON'}),
    org: Flags.string({description: 'Organization UUID, API key, name, or slug'}),
  }

  async run() {
    const {args, flags} = await this.parse(Api)
    const {client} = await getOrganizationContext(this.config.configDir, flags)
    const data = (flags.data || flags.file) ? await parseInput(flags) : undefined
    const result = await requestRaw(client, args.method, args.path, data)
    if (flags.json) return outputJson(this, result)
    printReadable(this, result)
  }
}
