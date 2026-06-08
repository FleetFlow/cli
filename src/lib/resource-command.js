import {Args, Command, Flags} from '@oclif/core'
import readline from 'node:readline/promises'
import {stdin as input, stdout as output} from 'node:process'
import {buildListQuery, getOrganizationContext, maybeFormData, parseInput, requestResource, requestResourceSchema} from './api-client.js'
import {outputJson, printReadable} from './output.js'
import {resourcesById} from './generated/resources.js'

export function makeResourceCommand(resourceId, action) {
  const resource = resourcesById[resourceId]
  const argEntries = {}
  for (const arg of resource.parentArgs) {
    argEntries[arg.name] = Args.string({description: arg.description, required: false})
  }
  if (['get', 'update', 'delete'].includes(action)) {
    argEntries.uuid = Args.string({description: `${resource.label} UUID`, required: false})
  }

  const flags = {
    json: Flags.boolean({description: 'Output raw JSON'}),
    org: Flags.string({description: 'Organization UUID, API key, name, or slug'}),
    schema: Flags.boolean({description: 'Show accepted request parameters for this command'}),
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
      if (!parsed.flags.schema) {
        requireArgs(resource, action, parsed.args)
      }

      const {client} = await getOrganizationContext(this.config.configDir, parsed.flags)

      if (parsed.flags.schema) {
        const schema = await requestResourceSchema(client, resource, action)
        if (parsed.flags.json) return outputJson(this, schema)
        return printSchema(this, schema, action)
      }

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

function requireArgs(resource, action, args) {
  const missing = resource.parentArgs
    .map((arg) => arg.name)
    .filter((name) => !args[name])

  if (['get', 'update', 'delete'].includes(action) && !args.uuid) {
    missing.push('uuid')
  }

  if (missing.length > 0) {
    throw new Error(`Missing required argument${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`)
  }
}

function printSchema(command, schema, action) {
  const method = {
    list: 'GET',
    create: 'POST',
    update: 'PATCH',
    get: 'GET',
    delete: 'DELETE',
  }[action]
  const methodSchema = schema.methods?.[method]

  if (!methodSchema) {
    command.log(`No ${method} schema available.`)
    return
  }

  command.log(`${method} ${methodSchema.path}`)

  for (const section of ['params', 'query', 'body', 'file', 'files']) {
    const fields = methodSchema[section]
    if (!fields || Object.keys(fields).length === 0) continue

    command.log(`\n${section}:`)
    for (const [name, spec] of Object.entries(fields)) {
      command.log(`  ${name}  ${formatSpec(spec)}`)
    }
  }
}

function formatSpec(spec) {
  if (!spec || typeof spec !== 'object') return String(spec)

  const details = []
  if (spec.type !== undefined) {
    details.push(`type=${Array.isArray(spec.type) ? spec.type.join('|') : spec.type}`)
  }
  details.push(`required=${Boolean(spec.required)}`)
  if (spec.may_be_null !== undefined) details.push(`nullable=${Boolean(spec.may_be_null)}`)
  if (spec.allowed_values) details.push(`allowed=${spec.allowed_values.join('|')}`)
  if (spec._error) details.push(spec._error)
  return details.join(' ')
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
