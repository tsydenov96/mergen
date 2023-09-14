import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Device } from '../../utils/validators'
import createHttpError from 'http-errors'
import { DbCollections, DeviceStatus, ServerMessages } from '../../config/enums'


export const create: RequestHandler<
  never,
  Device,
  Omit<Device, '_id' | 'createdAt' | 'updatedAt' | 'status'>,
  never
> = async (req, res, next) => {
  const device = req.body
  const db = await getDb()
  const createdAt = Date.now()

  const deviceData = {
    ...device,
    lastMsgTime: 0,
    online: false,
    ping: NaN,
    status: DeviceStatus.CLOSE,
    createdAt,
    updatedAt: createdAt,
  }
  const maybeNewDevice = await db
    .collection(DbCollections.DEVICES)
    .updateOne(
      { name: device.name },
      { $setOnInsert: deviceData },
      { upsert: true }
    )

  if (!maybeNewDevice.upsertedCount)
    return next(createHttpError.BadRequest(ServerMessages.NAME_EXISTS))

  const newDevice = {
    _id: maybeNewDevice.upsertedId,
    ...deviceData
  }

  if (device.addressId) {
    const updatedAt = Date.now()
    const maybeNewAddress = await db
      .collection(DbCollections.ADDRESSES)
      .findOneAndUpdate(
        { _id: device.addressId },
        {
          $addToSet: { devices: newDevice._id },
          $set: { updatedAt },
        },
        { returnDocument: 'after' }
      )

    if (!maybeNewAddress.value) {
      newDevice.addressId = undefined
      device.addressId = undefined
      db.collection(DbCollections.DEVICES)
        .updateOne(
          { _id: newDevice._id },
          { addressId: undefined }
        )
    }
    else {
      const newAddress = maybeNewAddress.value
      db.collection(DbCollections.ROLES)
        .updateMany(
          { _id: { $in: [newAddress.accessRoleId, newAddress.blockRoleId] }, "rules.DEVICE.actions": { $in: ["READ"] } },
          {
            $addToSet: {
              "rules.DEVICE.$.resources": newDevice._id
            },
            $set: { updatedAt },
          },
        )
    }
  }

  return res.send(newDevice)
}