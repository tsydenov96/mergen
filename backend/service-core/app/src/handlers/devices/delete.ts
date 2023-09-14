import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Device } from '../../utils/validators'
import createHttpError from 'http-errors'
import { ObjectId, WithId } from 'mongodb'
import { DbCollections } from '../../config/enums'

export const remove: RequestHandler<
  { id: string },
  WithId<Device>,
  never,
  never
> = async (req, res, next) => {
  const { id } = req.params
  const db = await getDb()

  const deleteRes = await db
    .collection(DbCollections.DEVICES)
    .findOneAndDelete({
      _id: new ObjectId(id)
    })

  if (!deleteRes.value)
    return next(createHttpError.NotFound())

  const device = deleteRes.value

  if (device.addressId) {
    const updatedAt = Date.now()
    const maybeNewAddress = await db
      .collection(DbCollections.ADDRESSES)
      .findOneAndUpdate(
        { _id: device.addressId },
        { 
          $pull: { devices: device._id },
          $set: { updatedAt },
        },
        { returnDocument: 'after' },
      )

    if (maybeNewAddress.value) {
      const newAddress = maybeNewAddress.value

      db.collection(DbCollections.ROLES)
        .updateMany(
          { _id: { $in: [newAddress.accessRoleId, newAddress.blockRoleId] }, "rules.DEVICE.actions": { $in: ["READ"] } },
          {
            $pullAll: {
              "rules.DEVICE.$.resources": [device._id]
            },
            $set: { updatedAt },
          },
        )
    }
  }

  return res.send(device)
}