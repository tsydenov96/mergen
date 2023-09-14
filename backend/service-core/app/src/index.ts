import app from './app'
import { PORT } from './config/config'
import { getDb } from './services/mongodb'
import { subscribeNatsServer } from './services/nats.service'

const start = async () => {
  await getDb()
  app.listen(PORT, () => console.log(`[SERVER STARTED ON ${PORT}]`))

  subscribeNatsServer()
}

start()