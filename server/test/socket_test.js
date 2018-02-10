/* global after before describe it */

const assert = require('assert')
const cio = require('socket.io-client')
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

  after(done => {
    io.close(done)
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
    function testDocument() {
      request(http)
        .get(`/docs/${docId}`)
        .expect(removeMetaKeys)
        .expect(200, patchedDoc)
        .end((err) => {
          if (retries && err) {
            testDocument()
          } else {
            done(err)
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

