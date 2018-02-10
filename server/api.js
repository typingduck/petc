/**
 * App for getting json documents from couchdb and allowing json-patch
 * updates.
 *
 */

const axios = require('axios')
var bodyParser = require('body-parser')
const express = require('express')
const requestLogger = require('morgan')
const jsonpatch = require('json-patch')

const config = require('./conf/config')
const log = require('./conf/log')

/**
 * Setup
 */
const app = express()

if (!process.env.LOADED_MOCHA_OPTS) {
  // disable request logging in tests
  app.use(requestLogger('combined'))
}

app.use(bodyParser.json())

/**
 * Homepage
 */
app.get('/', (req, res) => res.send('API: Pannus et Circulos (Cloth and Circles)'))

/**
 * Get document.
 */
app.get('/docs/:docId', async (req, res, next) => {
  try {
    const docId = req.params.docId
    const { data } = await db().get('/petc/' + docId)
    res.send(data)
  } catch (err) {
    err.status = err.response && err.response.status
    next(err)
  }
})

/**
 * Put a document (either create or update).
 */
app.put('/docs/:docId', async (req, res, next) => {
  try {
    const docId = req.params.docId
    const { data } = await db().put('/petc/' + docId, req.body)
    res.send(data)
  } catch (err) {
    err.status = err.response && err.response.status
    next(err)
  }
})

/**
 * Patch a document.
 * Takes one or more patches (https://tools.ietf.org/html/rfc6902) operations
 * to be performed on document. If all operations are succesful they are
 * applied and the resulting document saved and returned.
 */
app.patch('/docs/:docId', async (req, res, next) => {
  try {
    const docId = req.params.docId
    const patches = req.body
    const doc = await app.applyPatches(docId, patches)
    app.emitPatches(docId, patches)
    res.send(doc)
  } catch (err) {
    err.status = err.response && err.response.status
    if (err instanceof jsonpatch.InvalidPatchError) {
      err.status = 400
    }
    next(err)
  }
})


/**
 * Apply patches to a document.
 * Added to the `app` to make public for use by sockets to apply updates too.
 */
app.applyPatches = async (docId, patches) => {
  try {
    log.info(`apply patches to doc ${docId}:`, patches)
    const { data } = await db().get('/petc/' + docId)
    const doc = data
    jsonpatch.apply(doc, patches)
    const resp = await db().put('/petc/' + docId, doc)
    doc._rev = resp.data.rev
    log.info(`apply patches to doc ${docId} done succesfully`)
    return doc
  } catch (err) {
    if (err.response && err.response.status === 409) {
      // There is an obvious race condition between getting the document
      // and saving it when multiple callers are applying changes. This
      // could be fixed with a semaphore to lock the update function but it is
      // a little simpler to let the database do the heavy lifting and retry
      // when the database notifies that the document is outdated.
      return app.applyPatches(docId, patches)
    } else {
      log.info(`apply patches to doc ${docId} resp:`, err.message)
      throw err
    }
  }
}

/**
 * Allows sockets to receive updates that are applied through http request.
 */
app.emitPatches = (docId, patches) => {
  app.emit('doc-patch', docId, patches)
}

/**
 * Error handling
 */
app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
  log.error(err)
  res.status(err.status || 500).send({
    'error': err.name,
    'message': err.message
  })
})

/**
 * Create axios db client.
 */
function db () {
  return axios.create({
    baseURL: config.DB_URL,
    auth: config.DB_AUTH
  })
}

module.exports = app
