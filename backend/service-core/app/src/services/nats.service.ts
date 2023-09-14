import { readFileSync } from 'fs'
import {
  connect,
  JSONCodec,
  NatsConnection,
  RequestOptions
} from 'nats'
import {
  NATS_CREDS,
  NATS_SERVER_URL,
  NATS_TOPIC_CHECK_ALLOWANCE,
  NATS_TOPIC_DEVICE_BASE,
  NATS_TOPIC_GET_ALLOWED_RESOURCES
} from '../config/config'
import { handleDeviceMessage } from '../handlers/nats-events'
import { AccessConrtolActions } from '../config/enums'

const natsCreds = readFileSync(NATS_CREDS)
const jsonCodec = JSONCodec()

let natsServer: NatsConnection | null = null

async function getNatsServer(): Promise<NatsConnection> {
  if (natsServer) return natsServer

  natsServer = await connect({
    servers: NATS_SERVER_URL,
    user: natsCreds.toString().split('\n')[0],
    pass: natsCreds.toString().split('\n')[1],
  })

  return natsServer
}

async function subscribeNatsServer() {
  const natsServer = await getNatsServer()

  const sub = natsServer.subscribe(NATS_TOPIC_DEVICE_BASE);
  (async (sub) => {
    for await (const message of sub) {
      const res = await handleDeviceMessage(message)
      if (res) message.respond(jsonCodec.encode(res))
    }
    console.log('sub closed')
  })(sub)

  await natsServer.closed()
}

async function emit(topic: string, payload: Record<string, any>) {
  const natsServer = await getNatsServer()
  try {
    natsServer.publish(
      topic,
      jsonCodec.encode(payload)
    )
    console.log(`[EMIT]: ${topic}`)
  } catch (error) {
    console.log(`[EMIT ERROR]: ${error}`)
  }
}

async function request(topic: string, payload: Record<string, any>, options?: RequestOptions | undefined) {
  const natsServer = await getNatsServer()
  try {

    const ans = natsServer.request(
      topic,
      jsonCodec.encode(payload),
      options
    )
    console.log(`[EMIT]: ${topic}`)

    return ans;
  } catch (error) {
    console.log(`[EMIT ERROR]: ${error}`)
  }
}

async function checkAllowance(
  payload: {
    userId: string;
    kind: string;
    actions: AccessConrtolActions[],
    resources: string[]
  }
): Promise<any> {
  try {
    natsServer = await getNatsServer()
    const { data: result } = await natsServer.request(
      NATS_TOPIC_CHECK_ALLOWANCE,
      jsonCodec.encode(payload),
      { timeout: 4000 }
    )

    return jsonCodec.decode(result)
  } catch (error) {
    return { allowance: false }
  }
}

async function getAllowedResources(
  payload: {
    userId: string;
    kind: string;
    actions: AccessConrtolActions[]
  }
): Promise<Record<string, never[]>> {
  try {
    natsServer = await getNatsServer()
    const { data: result } = await natsServer.request(
      NATS_TOPIC_GET_ALLOWED_RESOURCES,
      jsonCodec.encode(payload),
      { timeout: 4000 }
    )

    return jsonCodec.decode(result) as Record<string, any>
  } catch (error: any) {
    console.log(`[GET ALLOWED RESOURCES][NATS REQUEST][ERROR]: ${error.code}`)
    return { resources: [] }
  }
}

export {
  checkAllowance,
  getAllowedResources,
  getNatsServer,
  jsonCodec,
  emit,
  request,
  subscribeNatsServer,
}