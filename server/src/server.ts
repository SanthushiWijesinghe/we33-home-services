import { app } from './app.js'
import { env } from './config/env.js'

const server = app.listen(env.PORT, () => console.info(`HomeServices API listening on ${env.PORT}`))
const stop = () => server.close(() => process.exit(0))
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
