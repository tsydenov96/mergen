import { Msg } from "nats"
import { getDb } from "../../services/mongodb"
import { jsonCodec } from "../../services/nats.service"
import { DbCollections } from "../../config/enums"
import { NATS_SUBJECT_VITALS } from "../../config/config"


export const handleDeviceMessage = async (msg: Msg): Promise<Uint8Array | undefined> => {
  try {
    const db = await getDb()
    const { subject, data } = msg

    const tokens = subject.split('.')
    if (tokens.length != 3)
      return

    const [_, deviceTopic, commandSubject] = tokens

    const device = await db
      .collection(DbCollections.DEVICES)
      .findOne({ topic: deviceTopic })

    if (!device) {
      console.error(`No device with such topic ${deviceTopic}`);
      return;
    }

    const jsnData = jsonCodec.decode(data) as Record<string, any>

    if (commandSubject === NATS_SUBJECT_VITALS) {
      
      await db
        .collection(DbCollections.DEVICES)
        .updateOne(
          { _id: device._id },
          {
            $set: {
              ping: jsnData.ping,
              online: true,
              lastMsgTime: jsnData.time,
              updatedAt: Date.now(),
            }
          }
        )
    }

  } catch (e) {
    console.error(e);
  }
}