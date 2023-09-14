import { Db, MongoClient, MongoClientOptions } from 'mongodb'
import { MONGO_CA, MONGO_DB, MONGO_URL } from '../config/config'

let cachedDb: Db | null = null

export async function getDb() {
  if (cachedDb) return cachedDb

  try {
    const client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tlsInsecure: true,
      tls: true,
      tlsCAFile: MONGO_CA,
    } as MongoClientOptions)

    const db = client.db(MONGO_DB)
    cachedDb = db

    return db

  } catch (err: any) {
    console.error(`[ERROR] ${err}\n${err.stack}`)
    console.trace()

    process.exit()
  }
}