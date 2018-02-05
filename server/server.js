/**
 * Wraps the API app in a http server
 */
const http = require('http')

const app = require('./api')
const config = require('./conf/config.js')
const log = require('./conf/log.js')

var server = http.createServer(app)
server.listen(config.SERVER_PORT)

server.on('error', onError)
server.on('listening', onListening)

function onListening () {
  log.info('listening on %s ...', config.SERVER_PORT)
}

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    log.error('port requires elevated privileges')
    process.exit(1)
    break
  case 'EADDRINUSE':
    log.error('port is already in use')
    process.exit(1)
    break
  default:
    throw error
  }
}
