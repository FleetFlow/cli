import {afterEach, describe, expect, test} from 'bun:test'
import {createClient, isRetryableNetworkError, requestRaw, withNetworkRetry} from '../src/lib/api-client.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

function networkError(code) {
  return new TypeError('fetch failed', {cause: Object.assign(new Error(code), {code})})
}

const noWait = {delays: [0, 0, 0], sleep: async () => {}}

describe('isRetryableNetworkError', () => {
  test('a connection that was never made is retried for every method', () => {
    expect(isRetryableNetworkError(networkError('UND_ERR_CONNECT_TIMEOUT'), 'POST')).toBe(true)
    expect(isRetryableNetworkError(networkError('ECONNREFUSED'), 'PATCH')).toBe(true)
  })

  test('a connection that broke mid-request is only retried for requests safe to repeat', () => {
    expect(isRetryableNetworkError(networkError('ECONNRESET'), 'GET')).toBe(true)
    expect(isRetryableNetworkError(networkError('ECONNRESET'), 'DELETE')).toBe(true)
    expect(isRetryableNetworkError(networkError('ECONNRESET'), 'POST')).toBe(false)
  })

  test('error responses from FleetFlow are not retried', () => {
    expect(isRetryableNetworkError(new Error('A model metadata config with this key already exists'), 'GET')).toBe(false)
  })
})

describe('withNetworkRetry', () => {
  test('tries again after a connection timeout and returns the result', async () => {
    let calls = 0
    const result = await withNetworkRetry('POST', async () => {
      calls++
      if (calls < 3) throw networkError('UND_ERR_CONNECT_TIMEOUT')
      return 'created'
    }, noWait)
    expect(result).toBe('created')
    expect(calls).toBe(3)
  })

  test('gives up after the last retry', async () => {
    let calls = 0
    await expect(withNetworkRetry('GET', async () => {
      calls++
      throw networkError('ECONNRESET')
    }, noWait)).rejects.toThrow('fetch failed')
    expect(calls).toBe(4)
  })

  test('does not repeat a POST whose connection broke mid-request', async () => {
    let calls = 0
    await expect(withNetworkRetry('POST', async () => {
      calls++
      throw networkError('ECONNRESET')
    }, noWait)).rejects.toThrow('fetch failed')
    expect(calls).toBe(1)
  })
})

describe('client requests', () => {
  test('a raw API request is retried after a connection timeout', async () => {
    let calls = 0
    globalThis.fetch = async () => {
      calls++
      if (calls === 1) throw networkError('UND_ERR_CONNECT_TIMEOUT')
      return new Response(JSON.stringify({message: 'ok', data: {uuid: 'x'}}), {status: 200, headers: {'content-type': 'application/json'}})
    }
    const client = createClient({host: 'fleetflow.io', accessToken: 'token'}, {api_key: 'key'})
    const originalWrite = process.stderr.write
    process.stderr.write = () => true
    try {
      const result = await requestRaw(client, 'post', '/v1/models/x/metadata', {key: 'a'})
      expect(result).toEqual({uuid: 'x'})
    } finally {
      process.stderr.write = originalWrite
    }
    expect(calls).toBe(2)
  })
})
