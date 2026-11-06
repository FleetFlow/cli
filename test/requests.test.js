import {afterEach, describe, expect, test} from 'bun:test'
import {createClient, maybeFormData, parseUploads, requestRaw, requestResource, requestResourceSchema} from '../src/lib/api-client.js'
import {mkdtemp, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
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
    await requestResource(client, resourcesById['vehicles/products'], 'list', {vehicle_uuid: 'vehicle-1'}, {})
    expect(captured).toEqual({
      url: 'http://localhost:3002/v1/vehicles/vehicle-1/products',
      method: 'GET',
    })
  })

  test('requests method schemas through OPTIONS', async () => {
    let captured
    globalThis.fetch = async (url, options) => {
      captured = {url: String(url), method: options.method, body: options.body}
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
      body: null,
    })
    expect(schema.methods.PATCH.body.sort_order.type).toBe('integer')
  })

  test('sends raw OPTIONS requests without a body', async () => {
    let captured
    globalThis.fetch = async (url, options) => {
      captured = {url: String(url), method: options.method, body: options.body}
      return new Response(JSON.stringify({data: {ok: true}}), {
        status: 200,
        headers: {'content-type': 'application/json'},
      })
    }
    const client = createClient({host: 'localhost', accessToken: 'access'}, {api_key: 'api-key'})
    const result = await requestRaw(client, 'options', '/v1/articles/{uuid1}?method=PATCH')

    expect(captured).toEqual({
      url: 'http://localhost:3002/v1/articles/{uuid1}?method=PATCH',
      method: 'OPTIONS',
      body: null,
    })
    expect(result.ok).toBe(true)
  })

  test('uploads a firmware file as multipart form data', async () => {
    let captured
    globalThis.fetch = async (url, options) => {
      captured = {url: String(url), method: options.method, headers: options.headers, body: options.body}
      return new Response(JSON.stringify({data: {uuid: 'firmware-1'}}), {status: 200, headers: {'content-type': 'application/json'}})
    }
    const dir = await mkdtemp(path.join(tmpdir(), 'ff-upload-'))
    const binary = path.join(dir, 'remote_1.3.1.bin')
    await writeFile(binary, Buffer.from([0xe9, 0x06, 0x02, 0x2f]))

    const client = createClient({host: 'localhost', accessToken: 'access'}, {api_key: 'api-key'})
    const body = await maybeFormData({version: '1.3.1', sequence: 1, requirements: ['a']}, parseUploads([binary]))
    await requestResource(client, resourcesById['products/firmwares'], 'create', {product_uuid: 'product-1'}, body)

    expect(captured.url).toBe('http://localhost:3002/v1/products/product-1/firmwares')
    expect(captured.method).toBe('POST')
    expect(captured.body).toBeInstanceOf(FormData)
    expect(captured.headers['Content-Type']).toBeUndefined()
    expect(captured.body.get('version')).toBe('1.3.1')
    expect(captured.body.get('sequence')).toBe('1')
    expect(captured.body.get('requirements')).toBe('["a"]')
    const file = captured.body.get('file')
    expect(file.name).toBe('remote_1.3.1.bin')
    expect([...new Uint8Array(await file.arrayBuffer())]).toEqual([0xe9, 0x06, 0x02, 0x2f])
  })

  test('parses upload fields and keeps JSON without files', async () => {
    expect(parseUploads(['./build/app.bin', 'image=./logo.png', 'attachments[]=./a.pdf'])).toEqual([
      {field: 'file', path: './build/app.bin'},
      {field: 'image', path: './logo.png'},
      {field: 'attachments[]', path: './a.pdf'},
    ])
    expect(await maybeFormData({name: 'Bike'}, [])).toEqual({name: 'Bike'})
  })
})
