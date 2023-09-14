import { jsonCodec, request } from "../../services/nats.service";
import { DeviceStatus } from "../../config/enums";
import { NATS_TOPIC_DEVICE_CONTROL } from "../../config/config";


export async function setDeviceStatus(topic: string, status: DeviceStatus): Promise<Record<string, any> | undefined> {
  const payload = {
    command: status,
  }
  try {
    const ans = await request(NATS_TOPIC_DEVICE_CONTROL + topic, payload, { timeout: 5000 })
    if (!ans?.data) throw new Error('nats or device not working')
    return jsonCodec.decode(ans?.data) as Record<string, any>

  } catch (e) {
    console.log(e);
    return
  }
}