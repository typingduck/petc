const winston = require('winston')

winston.addColors(winston.config.npm.colors)

winston.remove(winston.transports.Console)
winston.add(
  winston.transports.Console,
  { colorize: true, timestamp: true }
)

module.exports = winston
