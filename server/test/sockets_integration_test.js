/* global after before describe it */

const assert = require('assert')
const cio = require('socket.io-client')
const jsonpatch = require('json-patch')
const request = require('supertest-as-promised')
const uuid = require('uuid/v4')

const {http, io} = require('./../socket')

after(done => {
  io.close(done)
})

describe('socket clients', () => {
  const serverAddress = request(http).get('/').url

  const docId = uuid()
  const docId2 = uuid()

  const docValue = {}
  const client1Patch = { 'op': 'add', 'path': '/a', 'value': 1 }
  const client2Patch = { 'op': 'add', 'path': '/b', 'value': 2 }
  const httpPatch = { 'op': 'add', 'path': '/c', 'value': 3 }
  const patchedDoc = { 'a': 1, 'b': 2, 'c': 3 }

  let client1
  let client2
  let clientOtherdoc
  let clientOtherdocReceived = false

  before(async () => {
    await apiCreateDocument(docId, docValue)
    await apiCreateDocument(docId2, {})
    client1 = await socketConnect(serverAddress)
    client1.emit('doc-select', docId)
    client2 = await socketConnect(serverAddress)
    client2.emit('doc-select', docId)
    clientOtherdoc = await socketConnect(serverAddress)
    clientOtherdoc.emit('doc-select', docId2)
    clientOtherdoc.on('doc-patch', () => { clientOtherdocReceived = true })
  })

  after(() => {
    return Promise.all([
      socketDisconnect(client1),
      socketDisconnect(client2),
      socketDisconnect(clientOtherdoc)
    ])
  })

  it('should broadcast patches to other clients', async () => {
    const patch1P = socketReceivePatch(client1)
    const patch2P = socketReceivePatch(client2)

    socketPatch(client1, client1Patch)
    socketPatch(client2, client2Patch)

    const [patch1, patch2] = await Promise.all([patch1P, patch2P])

    assert.deepEqual(client2Patch, patch1)
    assert.deepEqual(client1Patch, patch2)
  })

  it('should broadcast http updates to clients', async () => {
    const patch1P = socketReceivePatch(client1)
    const patch2P = socketReceivePatch(client2)

    await apiPatch(docId, httpPatch)

    const [patch1, patch2] = await Promise.all([patch1P, patch2P])
    assert.deepEqual(httpPatch, patch1)
    assert.deepEqual(httpPatch, patch2)
  })

  it('should only broadcast updates to same document clients', async () => {
    assert(!clientOtherdocReceived, 'sent messages to wrong doc')
  })

  it('should save patches', () => {
    // socket.io messages are async so retry until success a few times
    return retry(10, () => apiCheckDocument(docId, patchedDoc))
  })
})

// Test shows the limitiations of the current patch protocol for
// two clients updating the same values at the same time.
// Here we sequence the steps so a client1 goes first, then client2 goes
// but ideally we would have the 2 clients editing at the same time.
// The solution is to either slow down the clients by waiting for a
// write response from the backend or a better protocol (in the works)
describe('socket patch conflicts', () => {
  const serverAddress = request(http).get('/').url
  const docId = uuid()

  const docValue = { 'field': 'first' }
  const client1Patch = { 'op': 'replace', 'path': '/field', 'value': 'patch1' }
  const client2Patch = { 'op': 'replace', 'path': '/field', 'value': 'patch2' }
  let client1Doc = Object.assign({}, docValue)
  let client2Doc = Object.assign({}, docValue)

  before(() => {
    return apiCreateDocument(docId, docValue)
  })

  it('clients and db should agree on state', async () => {
    const client1 = await socketConnect(serverAddress)
    client1.emit('doc-select', docId)
    const client2 = await socketConnect(serverAddress)
    client2.emit('doc-select', docId)

    const patch1P = socketReceivePatch(client1)
    const patch2P = socketReceivePatch(client2)

    // client1 emits update
    client1Doc = applyPatch(client1Doc, client1Patch)
    socketPatch(client1, client1Patch)
    const patch2 = await patch2P
    client2Doc = applyPatch(client2Doc, patch2)

    // client2 emits update
    client2Doc = applyPatch(client2Doc, client2Patch)
    socketPatch(client2, client2Patch)
    const patch1 = await patch1P
    client1Doc = applyPatch(client1Doc, patch1)

    const { body: dbDoc } = await retry(10, () =>
      apiCheckDocument(docId, { 'field': 'patch2' }))

    assert.notEqual(dbDoc.field, 'first')
    assert.deepEqual(dbDoc, client1Doc)
    assert.deepEqual(dbDoc, client2Doc)

    return Promise.all([
      socketDisconnect(client1),
      socketDisconnect(client2)
    ])
  })
})

/**
 * Utility functions
 */

function removeMetaKeys (response) {
  delete response.body['_id']
  delete response.body['_rev']
}

function applyPatch (document, patch) {
  const newDoc = Object.assign({}, document)
  jsonpatch.apply(newDoc, patch)
  return newDoc
}

/**
 * Http API functions
 */

function apiCreateDocument (docId, document) {
  return request(http)
    .put(`/docs/${docId}`)
    .send(document)
    .expect(200)
}

function apiCheckDocument (docId, document) {
  return request(http)
    .get(`/docs/${docId}`)
    .expect(removeMetaKeys)
    .expect(200, document)
}

function apiPatch (docId, patch) {
  return request(http)
    .patch(`/docs/${docId}`)
    .send(patch)
    .expect(200)
}

/**
 * Socket functions
 */

function socketConnect (serverAddress) {
  return new Promise(resolve => {
    const client = cio.connect(serverAddress)
    client.on('connect', () => resolve(client))
  })
}

function socketPatch (client, patch) {
  client.emit('doc-patch', patch)
}

function socketReceivePatch (client) {
  return new Promise(resolve => {
    client.on('doc-patch', patch => resolve(patch))
  })
}

function socketDisconnect (client) {
  return new Promise(resolve => {
    client.on('disconnect', resolve)
    client.disconnect()
  })
}

/**
 * Returns a retrying promise that tries the promise returned by 'fn' for
 * 'retries' number of goes.
 */
function retry (retries, fn) {
  return fn()
    .catch(err => retries > 1 ? retry(retries - 1, fn) : Promise.reject(err))
}
