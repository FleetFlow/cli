import {describe, expect, test} from 'bun:test'
import {mkdtemp, rm} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {mergeTokenState, readState, resolveOrganization, writeState} from '../src/lib/state.js'
import {buildListQuery, buildRequestHeaders, parseInput} from '../src/lib/api-client.js'

describe('state and input helpers', () => {
  test('persists session state', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ff-cli-'))
    try {
      await writeState(dir, {host: 'localhost', accessToken: 'token'})
      expect(await readState(dir)).toEqual({host: 'localhost', accessToken: 'token'})
    } finally {
      await rm(dir, {recursive: true, force: true})
    }
  })

  test('merges token expiry', () => {
    const state = mergeTokenState({refreshToken: 'old'}, {
      access_token: 'new-access',
      token_type: 'Bearer',
      expires_in: 10,
      scope: 'read write',
    }, 1000)
    expect(state.accessToken).toBe('new-access')
    expect(state.refreshToken).toBe('old')
    expect(state.expiresAt).toBe(11_000)
  })

  test('resolves org precedence', () => {
    const profile = {
      organizations: [
        {uuid: 'one', api_key: 'key-one', name: 'One'},
        {uuid: 'two', api_key: 'key-two', name: 'Two'},
      ],
    }
    expect(resolveOrganization({explicitOrg: 'Two', envOrg: 'one', selectedOrg: null, profile}).uuid).toBe('two')
    expect(resolveOrganization({explicitOrg: null, envOrg: 'one', selectedOrg: null, profile}).uuid).toBe('one')
    expect(resolveOrganization({explicitOrg: null, envOrg: null, selectedOrg: {uuid: 'two'}, profile}).uuid).toBe('two')
  })

  test('parses flags into list query and request headers', () => {
    expect(buildListQuery({page: 2, query: 'bike', match: ['status=active'], 'no-limit': true})).toEqual({
      page: 2,
      query: 'bike',
      status: 'active',
      no_limit: true,
    })
    expect(buildRequestHeaders({accessToken: 'a', apiKey: 'k'})).toEqual({
      Authorization: 'Bearer a',
      'X-Api-Key': 'k',
    })
  })

  test('parses JSON and repeated field input', async () => {
    expect(await parseInput({data: '{"name":"Bike"}'})).toEqual({name: 'Bike'})
    expect(await parseInput({field: ['name=Bike', 'count=2', 'enabled=true', 'meta.color=red']})).toEqual({
      name: 'Bike',
      count: 2,
      enabled: true,
      meta: {color: 'red'},
    })
  })
})
