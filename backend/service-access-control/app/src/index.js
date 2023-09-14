import {
  readFileSync
} from 'fs'
import {
  connect,
  // credsAuthenticator,
  JSONCodec
} from 'nats'
import {
  NATS_CREDS,
  NATS_SERVER_URL,
  NATS_TOPIC_BASE,
  NATS_TOPIC_CHECK_ALLOWANCE,
  NATS_TOPIC_GET_ALLOWED_RESOURCES
} from './config.js'
import {
  checkAllowance,
  getAllowedResources
} from './handlers/index.js'

const natsCreds = readFileSync(NATS_CREDS)
const jsonCodec = JSONCodec()

const natsServer = await connect({
  servers: NATS_SERVER_URL,
  user: natsCreds.toString().split('\n')[0],
  pass: natsCreds.toString().split('\n')[1],
})

const sub = natsServer.subscribe(NATS_TOPIC_BASE);

(async (sub) => {

  console.log(`LISTENING ${sub.getSubject()} REQUESTS [uptime | stop]`)

  for await (const message of sub) {
    const {
      subject,
      data
    } = message
    let result = {}

    switch (subject) {
      case NATS_TOPIC_CHECK_ALLOWANCE:
        console.log('check-allowance')
        result = await checkAllowance(jsonCodec.decode(data))
        break
      case NATS_TOPIC_GET_ALLOWED_RESOURCES:
        console.log('get-allowed-resources')
        result = await getAllowedResources(jsonCodec.decode(data))
        break
      default:
        break
    }
    message.respond(jsonCodec.encode(result))
  }
  console.log('sub closed')
})(sub)

await natsServer.closed().then(err => {
  let message = `[CONNECTION TO ${natsServer.getServer()} CLOSED]`
  if (err) {
    message = `${message} WITH ERROR: ${err.message}`
  }
  console.log(message)
})