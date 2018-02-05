/* global describe it */

const request = require('supertest')
const uuid = require('uuid/v4')

const app = require('./../api')

describe('/', () => {
  it('should respond to get', done => {
    request(app)
      .get('/')
      .expect(200, done)
  })
})

describe('/docs basic', () => {
  const docId = uuid()

  it('should add empty doc ' + docId, done => {
    request(app)
      .put(`/docs/${docId}`)
      .expect(200, done)
  })

  it('should get empty doc', done => {
    request(app)
      .get(`/docs/${docId}`)
      .expect(200, done)
  })
})

describe('/docs complicated', () => {
  const docId = uuid()
  const docValue = { 'a': [1, 2, 3], 'b': 'x' }
  const patch = [
    { 'op': 'add', 'path': '/c', 'value': 'y' },
    { 'op': 'replace', 'path': '/a', 'value': 'z' }
  ]
  const patchedDoc = { 'a': 'z', 'b': 'x', 'c': 'y' }

  it('should add doc ' + docId, done => {
    request(app)
      .put(`/docs/${docId}`)
      .send(docValue)
      .expect(200, done)
  })

  it('should get doc', done => {
    request(app)
      .get(`/docs/${docId}`)
      .expect(removeMetaKeys)
      .expect(200, docValue, done)
  })

  it('should patch doc', done => {
    request(app)
      .patch(`/docs/${docId}`)
      .send(patch)
      .expect(removeMetaKeys)
      .expect(200, patchedDoc, done)
  })

  it('should get patched doc', done => {
    request(app)
      .get(`/docs/${docId}`)
      .expect(removeMetaKeys)
      .expect(200, patchedDoc, done)
  })
})

function removeMetaKeys (response) {
  delete response.body['_id']
  delete response.body['_rev']
}
