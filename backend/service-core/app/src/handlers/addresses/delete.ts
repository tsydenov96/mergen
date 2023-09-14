import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Address } from '../../utils/validators'
import createHttpError from 'http-errors'
import { ObjectId, WithId } from 'mongodb'
import { DbCollections } from '../../config/enums'

export const remove: RequestHandler<
  { id: string },
  WithId<Address>,
  { killChildren?: boolean },
  never
> = async (req, res, next) => {
  const { id } = req.params
  const { killChildren } = req.body
  const db = await getDb()

  const deleteRes = await db
    .collection(DbCollections.ADDRESSES)
    .findOneAndDelete({
      _id: new ObjectId(id)
    })

  if (!deleteRes.value)
    return next(new createHttpError.NotFound())

  const address = deleteRes.value
  res.send(address)

  if (killChildren) {
    db.collection(DbCollections.DEVICES)
      .deleteMany({ _id: { $in: address.devices } })
  } else {
    db.collection(DbCollections.DEVICES)
      .updateMany(
        { _id: { $in: address.devices } },
        { $set: { addressId: undefined } },
      )
  }

  db.collection(DbCollections.ROLES)
    .deleteMany({ _id: { $in: [address.accessRoleId, address.blockRoleId, address.adminRoleId] } })

  db.collection(DbCollections.USERS)
    .updateMany(
      { addressId: address._id },
      { $set: { addressId: undefined } },
    )
}