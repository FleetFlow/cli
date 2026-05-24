import {mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(root, '..')
const routesRoot = path.join(repoRoot, 'platform/services/organization-api/src/v1')
const generatedDir = path.join(root, 'src/lib/generated')
const commandsRoot = path.join(root, 'src/commands')
const manifestPath = path.join(generatedDir, 'command-files.json')

const crudFiles = {
  list: 'get.js',
  get: 'get-uuid.js',
  create: 'post.js',
  update: 'patch-uuid.js',
  delete: 'delete-uuid.js',
}

await mkdir(generatedDir, {recursive: true})
await removePreviouslyGenerated()

const resources = await collectResources(routesRoot)
resources.sort((a, b) => a.id.localeCompare(b.id))

const commandFiles = []
for (const resource of resources) {
  for (const action of Object.keys(crudFiles)) {
    const commandPath = path.join(commandsRoot, ...resource.segments, `${action}.js`)
    await mkdir(path.dirname(commandPath), {recursive: true})
    const relativeImport = toImportPath(path.relative(path.dirname(commandPath), path.join(root, 'src/lib/resource-command.js')))
    await writeFile(commandPath, [
      `import {makeResourceCommand} from '${relativeImport}'`,
      '',
      `export default makeResourceCommand(${JSON.stringify(resource.id)}, ${JSON.stringify(action)})`,
      '',
    ].join('\n'))
    commandFiles.push(path.relative(root, commandPath))
  }
}

await writeFile(path.join(generatedDir, 'resources.js'), [
  'export const resources = Object.freeze(',
  JSON.stringify(resources, null, 2),
  ')',
  '',
  'export const resourcesById = Object.freeze(Object.fromEntries(resources.map((resource) => [resource.id, resource])))',
  '',
].join('\n'))
await writeFile(manifestPath, `${JSON.stringify(commandFiles, null, 2)}\n`)

console.log(`Generated ${resources.length} resources and ${commandFiles.length} command files.`)

async function collectResources(dir, segments = []) {
  const entries = await readdir(dir, {withFileTypes: true})
  const names = new Set(entries.map((entry) => entry.name))
  const resources = []

  if (segments.length > 0 && Object.values(crudFiles).every((file) => names.has(file))) {
    resources.push(makeResource(segments))
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    resources.push(...await collectResources(path.join(dir, entry.name), [...segments, entry.name]))
  }

  return resources
}

function makeResource(segments) {
  return {
    id: segments.join('/'),
    command: segments.join(' '),
    segments,
    label: segments.join(' ').replaceAll('_', ' '),
    parentArgs: segments.slice(0, -1).map((segment) => ({
      name: `${singularize(segment)}_uuid`,
      description: `${segment.replaceAll('_', ' ')} UUID`,
    })),
  }
}

function singularize(value) {
  if (value.endsWith('ies')) return `${value.slice(0, -3)}y`
  if (value.endsWith('ses')) return value.slice(0, -2)
  if (value.endsWith('s') && !value.endsWith('ss')) return value.slice(0, -1)
  return value
}

function toImportPath(value) {
  const normalized = value.split(path.sep).join('/')
  return normalized.startsWith('.') ? normalized : `./${normalized}`
}

async function removePreviouslyGenerated() {
  let previous = []
  try {
    previous = JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  for (const relativeFile of previous) {
    await rm(path.join(root, relativeFile), {force: true})
  }
}
