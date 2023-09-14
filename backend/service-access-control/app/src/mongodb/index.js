import {
  MongoClient,
  ObjectId
} from 'mongodb'
import {
  MONGO_CA,
  MONGO_DB,
  MONGO_URL
} from '../config.js'

let cachedDb = null

async function getDb() {
  if (cachedDb) return cachedDb

  console.log(`[GET DB] ${MONGO_URL}`)
  try {
    const client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tlsInsecure: true,
      tls: true,
      tlsCAFile: MONGO_CA
    })

    const db = client.db(MONGO_DB)
    cachedDb = db

    return db
  } catch (err) {
    console.error(`[ERROR] ${err}\n${err.stack}`)
    console.trace()

    process.exit()
  }

}

export {
  getDb,
  ObjectId
}