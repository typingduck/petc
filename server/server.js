/**
 * Wraps the API app in a http server
 */

const {http} = require('./socket')

const log = require('./conf/log')
const config = require('./conf/config')

function onListening () {
  log.info('listening on %s ...', config.SERVER_PORT)
}

http.on('listening', onListening)

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

http.on('error', onError)

http.listen(config.SERVER_PORT)
