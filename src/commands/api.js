import {Args, Command, Flags} from '@oclif/core'
import {getOrganizationContext, maybeFormData, parseInput, parseUploads, requestRaw} from '../lib/api-client.js'
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
    field: Flags.string({description: 'Set a body field as key=value; supports dotted keys', multiple: true, multipleNonGreedy: true}),
    upload: Flags.string({description: 'Attach a file as [field=]path (multipart); a bare path is sent as "file". Repeatable', multiple: true, multipleNonGreedy: true}),
    json: Flags.boolean({description: 'Output raw JSON'}),
    org: Flags.string({description: 'Organization UUID, API key, name, or slug'}),
  }

  async run() {
    const {args, flags} = await this.parse(Api)
    const {client} = await getOrganizationContext(this.config.configDir, flags)
    const uploads = parseUploads(flags.upload)
    const hasBody = flags.data || flags.file || flags.field?.length
    const body = hasBody ? await parseInput(flags) : undefined
    const data = uploads.length > 0 ? await maybeFormData(body || {}, uploads) : body
    const result = await requestRaw(client, args.method, args.path, data)
    if (flags.json) return outputJson(this, result)
    printReadable(this, result)
  }
}
