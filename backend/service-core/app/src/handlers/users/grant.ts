import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { User } from '../../utils/validators'
import { ObjectId } from 'mongodb'
import createHttpError from 'http-errors'
import { DbCollections, ServerMessages } from '../../config/enums'

export const grant: RequestHandler<
  { id: string },
  User,
  { addressId: ObjectId },
  never
> = async (req, res, next) => {
  const { addressId } = req.body
  const { id } = req.params
  const db = await getDb()

  const user = await db
    .collection(DbCollections.USERS)
    .findOne({
      _id: new ObjectId(id)
    })

  if (!user)
    return next(createHttpError.NotFound())

  const address = await db
    .collection(DbCollections.ADDRESSES)
    .findOne({
      _id: addressId
    })

  if (!address)
    return next(createHttpError.InternalServerError(ServerMessages.RESOURCE_DOESNT_EXIST))

  const updateRes = await db
    .collection(DbCollections.USERS)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          roleId: address.adminRoleId,
          addressId: addressId,
          hasAccess: true,
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )

  if (!updateRes.value)
    return next(createHttpError.InternalServerError())
  delete updateRes.value['password']

  return res.send(updateRes.value)
}