/**
 * Wraps the API app in a http server, adds socket.io wrapper
 */

const app = require('./api')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const log = require('./conf/log')


io.on('connection', socket => {
  var docId = null

  // user connected

  socket.on('doc-select', selectedDocId => {
    docId = selectedDocId
    log.info('user connected to doc:', docId)
    socket.join(docId)
  })

  socket.on('doc-patch', patchOp => {
    if (docId) {
      app.applyPatches(docId, patchOp)
      socket.broadcast.emit('doc-patch', patchOp)
    }
  })

  socket.on('disconnect', () => {
    // user disconnected
    log.info('user disconnected from doc:', docId)
  })
})

module.exports = {http, io}
