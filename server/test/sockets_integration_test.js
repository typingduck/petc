/* global after before describe it */

const assert = require('assert')
const cio = require('socket.io-client')
const jsonpatch = require('json-patch')
const request = require('supertest')
const uuid = require('uuid/v4')

const {http, io} = require('./../socket')

describe('/', () => {
  it('should respond to get', done => {
    request(http)
      .get('/')
      .expect(200, done)
  })
})

describe('socket clients', () => {
  const serverAddress = request(http).get('/').url
  const docId = uuid()

  const docValue = {}
  const client1Patch = { 'op': 'add', 'path': '/a', 'value': 1 }
  const client2Patch = { 'op': 'add', 'path': '/b', 'value': 2 }
  const patchedDoc = { 'a': 1, 'b': 2 }

  before(done => {
    // Add test doc
    request(http)
      .put(`/docs/${docId}`)
      .send(docValue)
      .expect(200, done)
  })

  it('should broadcast patches to other clients', done => {
    var client1 = cio.connect(serverAddress)
    var numClientReceivedEvents = 0

    client1.on('connect', () => {
      var client2 = cio.connect(serverAddress)

      client2.on('connect', () => {
        client1.emit('doc-select', docId)
        client2.emit('doc-select', docId)
        client1.emit('doc-patch', client1Patch)
      })

      client2.on('doc-patch', msg => {
        numClientReceivedEvents++
        assert.deepEqual(msg, client1Patch)
        client2.emit('doc-patch', client2Patch)
        client2.disconnect()
      })
    })

    client1.on('doc-patch', msg => {
      numClientReceivedEvents++
      assert.deepEqual(msg, client2Patch)
      assert.equal(2, numClientReceivedEvents)
      client1.disconnect()
      done()
    })
  })

  it('should save patches', done => {
    // socket.io messages are async so retry until success a few times
    var retries = 10
    function testDocument () {
      request(http)
        .get(`/docs/${docId}`)
        .expect(removeMetaKeys)
        .expect(200, patchedDoc)
        .end((err) => {
          if (retries && err) {
            retries--
            testDocument()
          } else {
            done(err)
          }
        })
    }
    testDocument()
  })
})

describe('http clients to sockets', () => {
  const serverAddress = request(http).get('/').url
  const docId = uuid()

  const docValue = {}
  const httpPatch = { 'op': 'add', 'path': '/a', 'value': 1 }

  before(done => {
    // Add test doc
    request(http)
      .put(`/docs/${docId}`)
      .send(docValue)
      .expect(200, done)
  })

  it('should broadcast patches to clients', done => {
    var socketClient = cio.connect(serverAddress)

    socketClient.on('connect', () => {
      socketClient.emit('doc-select', docId)

      socketClient.on('doc-patch', msg => {
        assert.deepEqual(msg, httpPatch)
        socketClient.disconnect()
        done()
      })

      request(http)
        .patch(`/docs/${docId}`)
        .send(httpPatch)
        .expect(200, (err) => {
          if (err) done(err)
        })
    })
  })
})

describe('socket patch conflicts', () => {
  const serverAddress = request(http).get('/').url
  const docId = uuid()

  const docValue = { 'field': 'first' }
  const client1Patch = { 'op': 'replace', 'path': '/field', 'value': 'patch1' }
  const client2Patch = { 'op': 'replace', 'path': '/field', 'value': 'patch2' }
  const client1Doc = docValue
  const client2Doc = docValue

  before(done => {
    // Add test doc
    request(http)
      .put(`/docs/${docId}`)
      .send(docValue)
      .expect(200, done)
  })

  after(done => {
    io.close(done)
  })

  it('clients and db should agree on state', done => {
    var client1 = cio.connect(serverAddress)
    client1.on('connect', () => {
      client1.emit('doc-select', docId)
      client1.on('doc-patch', patches => {
        jsonpatch.apply(client1Doc, patches)
        client1.disconnect()
      })
    })

    var client2 = cio.connect(serverAddress)
    client2.on('connect', () => {
      client2.emit('doc-select', docId)
      client2.emit('doc-patch', client2Patch)
      client1.emit('doc-patch', client1Patch)
      client2.on('doc-patch', patches => {
        jsonpatch.apply(client2Doc, patches)
        client2.disconnect()
      })
    })

    function clientsAndDbAgree (dbDoc) {
      return dbDoc.field !== 'first' &&
        dbDoc.field === client1Doc.field &&
        dbDoc.field === client2Doc.field
    }

    // socket.io messages are async so retry until success a few times
    var retries = 10
    function testDocument () {
      request(http)
        .get(`/docs/${docId}`)
        .expect(removeMetaKeys)
        .expect(200)
        .end((err, res) => {
          if (retries && (err || !clientsAndDbAgree(res.body))) {
            retries--
            testDocument()
          } else if (retries) {
            done()
          } else {
            done(Error('db and clients failed to reach consensus'))
          }
        })
    }
    testDocument()
  })
})

function removeMetaKeys (response) {
  delete response.body['_id']
  delete response.body['_rev']
}
