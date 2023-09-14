import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Device } from '../../utils/validators'
import { ObjectId } from 'mongodb'
import createHttpError from 'http-errors'
import { setDeviceStatus } from '../nats-events/device'
import { DbCollections, DeviceStatus, ServerMessages } from '../../config/enums'
import { createEvent } from '../events/create'

export const control: RequestHandler<
  { id: string },
  Device,
  { command: DeviceStatus },
  never
> = async (req, res, next) => {
  const { command: cmd } = req.body
  const { id } = req.params
  const db = await getDb()

  const device = await db
    .collection(DbCollections.DEVICES)
    .findOne({
      _id: new ObjectId(id)
    })

  if (!device)
    return next(createHttpError.NotFound())

  const ans = await setDeviceStatus(device.topic, cmd)
  const respTime = ans?.time ?? undefined
  const success = (ans != null && 'msg' in ans && ans.msg == cmd)

  const event = await createEvent({
    deviceId: id,
    userId: req.auth.id!,
    deviceStatus: cmd,
    time: respTime,
    success,
  })

  if (!event)
    console.error('[DEVICE][CONTROL] Couldn\'t create event');

  if (success) {
    await db
      .collection(DbCollections.DEVICES)
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            online: true,
            lastMsgTime: Date.now(),
          }
        }
      )
    return res.send()
  }
  await db
    .collection(DbCollections.DEVICES)
    .updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          online: ans === undefined ? false : true,
          ping: ans === undefined ? NaN : ans.ping,
        }
      }
    )
  if (!ans)
    return next(createHttpError.RequestTimeout(ServerMessages.DEVICE_IS_OFFLINE))

  return next(createHttpError.InternalServerError())
}