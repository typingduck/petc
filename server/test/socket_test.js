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


describe('sockets', () => {
  const serverAddress = request(http).get('/').url
  const docId = uuid()
  const docValue = {}

  const client1Patch = { 'op': 'add', 'path': '/a', 'value': '1' }
  const client2Patch = { 'op': 'add', 'path': '/b', 'value': '2' }

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

    client1.on('connect', function(){
      var client2 = cio.connect(serverAddress)

      client2.on('connect', function(){
        client1.emit('doc-patch', client1Patch)
        client2.emit('doc-patch', client2Patch)
      })

      client2.on('doc-patch', function(msg){
        assert.deepEqual(msg, client1Patch)
        client2.disconnect()
      })

    })

    client1.on('doc-patch', function(msg){
      assert.deepEqual(msg, client2Patch)
      client1.disconnect()
      setTimeout(done, 1000)
    })
  })

})

