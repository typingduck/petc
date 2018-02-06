/**
 * Wraps the API app in a http server, adds socket.io wrapper
 */

const app = require('./api')
const http = require('http').Server(app)
const io = require('socket.io')(http)

io.on('connection', function(socket){
  // user connected

  socket.on('doc-patch', function(patchOp) {
    setTimeout(() => app.applyPatches(patchOp))
    socket.broadcast.emit('doc-patch', patchOp)
  })

  socket.on('disconnect', function(){
    // user disconnected
  })
})

module.exports = {http, io}
