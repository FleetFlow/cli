import {describe, expect, test} from 'bun:test'
import {readdir, readFile} from 'node:fs/promises'
import path from 'node:path'
import {resources, resourcesById} from '../src/lib/generated/resources.js'

const routesRoot = path.resolve(import.meta.dirname, '../../platform/services/organization-api/src/v1')
const crudFiles = ['get.js', 'get-uuid.js', 'post.js', 'patch-uuid.js', 'delete-uuid.js']

describe('generated resource registry', () => {
  test('covers CRUD route directories', async () => {
    const routeResources = await collectCrudResources(routesRoot)
    expect(resources.map((resource) => resource.id).sort()).toEqual(routeResources.sort())
  })

  test('includes common FleetFlow resources and nested examples', async () => {
    for (const id of [
      'vehicles',
      'vehicles/components',
      'vehicles/customers',
      'customers',
      'customers/vehicles',
      'models',
      'components',
      'products',
      'orders',
      'service_tickets',
      'users',
      'roles',
      'locations',
      'warranty_profiles',
      'maintenance_profiles',
      'diagnostic_profiles',
      'translations',
      'mobile_applications',
      'oauth_applications',
    ]) {
      expect(resourcesById[id]).toBeTruthy()
    }
  })

  test('agent guide describes registry-backed behavior', async () => {
    const guide = await readFile(path.resolve(import.meta.dirname, '../SKILL.md'), 'utf8')
    expect(guide).toContain('bun run generate')
    expect(guide).toContain('ff vehicles components list <vehicle_uuid>')
    expect(guide).toContain('ff api <get|post|patch|delete>')
  })
})

async function collectCrudResources(dir, segments = []) {
  const entries = await readdir(dir, {withFileTypes: true})
  const names = new Set(entries.map((entry) => entry.name))
  const matches = []
  if (segments.length > 0 && crudFiles.every((file) => names.has(file))) {
    matches.push(segments.join('/'))
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      matches.push(...await collectCrudResources(path.join(dir, entry.name), [...segments, entry.name]))
    }
  }
  return matches
}
