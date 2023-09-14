import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Device } from '../../utils/validators'
import { ObjectId, WithId } from 'mongodb'
import createHttpError from 'http-errors'
import { DbCollections } from '../../config/enums'

export const update: RequestHandler<
  { id: string },
  WithId<Device>,
  Omit<Device, '_id' | 'createdAt' | 'updatedAt' | 'status'>,
  {}
> = async (req, res, next) => {
  const device = req.body
  const { id } = req.params
  const deviceId = new ObjectId(id)
  const db = await getDb()
  const updatedAt = Date.now()
  const maybeOldDevice = await db
    .collection(DbCollections.DEVICES)
    .findOneAndUpdate(
      { _id: deviceId },
      {
        $set: {
          ...device,
          updatedAt: updatedAt
        }
      },
    )

  if (!maybeOldDevice.value)
    return next(createHttpError.NotFound())

  const oldDevice = maybeOldDevice.value

  if (oldDevice.addressId) {
    (async function () {
      const oldAddress = await db
        .collection(DbCollections.ADDRESSES)
        .findOneAndUpdate(
          { _id: oldDevice.addressId },
          {
            $pullAll: { devices: [deviceId] },
            $set: { updatedAt }
          },
          { returnDocument: 'after' },
        )

      if (oldAddress.value) {
        db.collection(DbCollections.ROLES)
          .updateMany(
            { _id: { $in: [oldAddress.value.accessRoleId, oldAddress.value.blockRoleId] }, "rules.DEVICE.actions": { $in: ["READ"] } },
            {
              $pullAll: {
                "rules.DEVICE.$.resources": [deviceId]
              },
              $set: { updatedAt },
            },
          )
      }
    })()
  }

  if (device.addressId) {
    const maybeNewAddress = await db
      .collection(DbCollections.ADDRESSES)
      .findOneAndUpdate(
        { _id: device.addressId },
        {
          $addToSet: { devices: deviceId },
          $set: { updatedAt }
        },
        { returnDocument: 'after' }
      )

    if (!maybeNewAddress.value) {
      device.addressId = undefined
      db.collection(DbCollections.DEVICES)
        .updateOne(
          { _id: deviceId },
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
              "rules.DEVICE.$.resources": deviceId
            },
            $set: { updatedAt }
          },
        )
    }
  }

  return res.send({
    ...oldDevice,
    ...device,
    updatedAt,
  })
}