import {afterEach, describe, expect, test} from 'bun:test'
import {createClient, requestResource, requestResourceSchema} from '../src/lib/api-client.js'
import {resourcesById} from '../src/lib/generated/resources.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('resource requests', () => {
  test('sends list/get/create/update/delete requests through the SDK', async () => {
    const calls = []
    globalThis.fetch = async (url, options) => {
      calls.push({
        url: String(url),
        method: options.method,
        headers: options.headers,
        body: options.body,
      })
      return new Response(JSON.stringify({data: {ok: true}}), {status: 200, headers: {'content-type': 'application/json'}})
    }
    const client = createClient({host: 'localhost', accessToken: 'access'}, {api_key: 'api-key'})
    const vehicles = resourcesById.vehicles
    await requestResource(client, vehicles, 'list', {}, {page: 1})
    await requestResource(client, vehicles, 'get', {uuid: 'vehicle-1'})
    await requestResource(client, vehicles, 'create', {}, {name: 'Bike'})
    await requestResource(client, vehicles, 'update', {uuid: 'vehicle-1'}, {name: 'Cargo'})
    await requestResource(client, vehicles, 'delete', {uuid: 'vehicle-1'})

    expect(calls.map((call) => call.method)).toEqual(['GET', 'GET', 'POST', 'PATCH', 'DELETE'])
    expect(calls[0].url).toBe('http://localhost:3002/v1/vehicles?page=1')
    expect(calls[1].url).toBe('http://localhost:3002/v1/vehicles/vehicle-1')
    expect(calls[2].body).toBe(JSON.stringify({name: 'Bike'}))
    for (const call of calls) {
      expect(call.headers.Authorization).toBe('Bearer access')
      expect(call.headers['X-Api-Key']).toBe('api-key')
    }
  })

  test('builds nested resource paths', async () => {
    let captured
    globalThis.fetch = async (url, options) => {
      captured = {url: String(url), method: options.method}
      return new Response(JSON.stringify({data: []}), {status: 200, headers: {'content-type': 'application/json'}})
    }
    const client = createClient({host: 'localhost', accessToken: 'access'}, {api_key: 'api-key'})
    await requestResource(client, resourcesById['vehicles/components'], 'list', {vehicle_uuid: 'vehicle-1'}, {})
    expect(captured).toEqual({
      url: 'http://localhost:3002/v1/vehicles/vehicle-1/components',
      method: 'GET',
    })
  })

  test('requests method schemas through OPTIONS', async () => {
    let captured
    globalThis.fetch = async (url, options) => {
      captured = {url: String(url), method: options.method}
      return new Response(JSON.stringify({data: {methods: {PATCH: {body: {sort_order: {type: 'integer'}}}}}}), {
        status: 200,
        headers: {'content-type': 'application/json'},
      })
    }
    const client = createClient({host: 'localhost', accessToken: 'access'}, {api_key: 'api-key'})
    const schema = await requestResourceSchema(client, resourcesById.articles, 'update')

    expect(captured).toEqual({
      url: 'http://localhost:3002/v1/articles/{uuid1}?method=PATCH',
      method: 'OPTIONS',
    })
    expect(schema.methods.PATCH.body.sort_order.type).toBe('integer')
  })
})
