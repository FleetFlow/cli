import {Args, Command, Flags} from '@oclif/core'
import readline from 'node:readline/promises'
import {stdin as input, stdout as output} from 'node:process'
import {buildListQuery, getOrganizationContext, maybeFormData, parseInput, requestResource} from './api-client.js'
import {outputJson, printReadable} from './output.js'
import {resourcesById} from './generated/resources.js'

export function makeResourceCommand(resourceId, action) {
  const resource = resourcesById[resourceId]
  const argEntries = {}
  for (const arg of resource.parentArgs) {
    argEntries[arg.name] = Args.string({description: arg.description, required: true})
  }
  if (['get', 'update', 'delete'].includes(action)) {
    argEntries.uuid = Args.string({description: `${resource.label} UUID`, required: true})
  }

  const flags = {
    json: Flags.boolean({description: 'Output raw JSON'}),
    org: Flags.string({description: 'Organization UUID, API key, name, or slug'}),
  }
  if (action === 'list') {
    flags.page = Flags.integer({description: 'Page number'})
    flags.query = Flags.string({description: 'Search query'})
    flags.match = Flags.string({description: 'Filter as key=value', multiple: true, multipleNonGreedy: true})
    flags['no-limit'] = Flags.boolean({description: 'Request all rows without pagination'})
  }
  if (['create', 'update'].includes(action)) {
    flags.data = Flags.string({description: 'JSON request body'})
    flags.file = Flags.file({description: 'Read JSON request body from a file'})
    flags.field = Flags.string({description: 'Set a body field as key=value; supports dotted keys', multiple: true, multipleNonGreedy: true})
    flags.image = Flags.file({description: 'Attach an image file'})
  }
  if (action === 'delete') {
    flags.force = Flags.boolean({char: 'f', description: 'Skip the confirmation prompt'})
  }

  return class GeneratedResourceCommand extends Command {
    static description = `${action} ${resource.label}`
    static aliases = buildAliases(resource, action)
    static args = argEntries
    static flags = flags

    async run() {
      const parsed = await this.parse(this.constructor)
      const {client} = await getOrganizationContext(this.config.configDir, parsed.flags)
      let data
      if (action === 'list') data = buildListQuery(parsed.flags)
      if (['create', 'update'].includes(action)) {
        data = await maybeFormData(await parseInput(parsed.flags), parsed.flags.image)
      }
      if (action === 'delete') await confirmDelete(this, parsed.flags)

      const result = await requestResource(client, resource, action, parsed.args, data)
      if (parsed.flags.json) return outputJson(this, result)
      printReadable(this, result)
    }
  }
}

function buildAliases(resource, action) {
  const aliases = []
  const dashed = resource.segments.map((segment) => segment.replaceAll('_', '-')).join(' ')
  if (dashed !== resource.command) aliases.push(`${dashed} ${action}`)

  const friendly = {
    'service_tickets': ['tickets', 'service-tickets'],
    'warranty_profiles': ['warranties', 'warranty-profiles'],
    'maintenance_profiles': ['maintenance', 'maintenance-profiles'],
    'diagnostic_profiles': ['diagnostics', 'diagnostic-profiles'],
    'mobile_applications': ['apps', 'mobile-applications'],
    'oauth_applications': ['oauth-apps', 'oauth-applications'],
    'vehicle_imports': ['imports', 'vehicle-imports'],
  }[resource.id]
  for (const alias of friendly || []) aliases.push(`${alias} ${action}`)

  if (resource.segments.length === 1 && resource.segments[0].endsWith('s')) {
    aliases.push(`${resource.segments[0].slice(0, -1)} ${action}`)
  }
  return aliases
}

async function confirmDelete(command, flags) {
  if (flags.force) return
  if (!process.stdin.isTTY) throw new Error('Refusing to delete without --force in a non-interactive shell.')
  const rl = readline.createInterface({input, output})
  try {
    const answer = await rl.question('Delete this resource? Type "delete" to continue: ')
    if (answer !== 'delete') throw new Error('Delete cancelled')
  } finally {
    rl.close()
  }
}
