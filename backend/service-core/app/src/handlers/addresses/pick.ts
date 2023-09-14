import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Address, User } from '../../utils/validators'
import { ObjectId, WithId } from 'mongodb'
import createHttpError from 'http-errors'
import { DbCollections } from '../../config/enums'

export const pick: RequestHandler<
  { id: string },
  WithId<User>,
  Omit<Address, '_id' | 'createdAt' | 'updatedAt'>,
  {}
> = async (req, res, next) => {
  const { id } = req.params
  const db = await getDb()

  const address = await db
    .collection(DbCollections.ADDRESSES)
    .findOne({ _id: new ObjectId(id) })

  if (!address)
    return next(createHttpError.NotFound())

  const setIds: any = {}

  setIds.addressId = address._id

  const oldUser = await db
    .collection(DbCollections.USERS)
    .findOne({ _id: new ObjectId(req.auth.id) })

  if (!oldUser)
    return next(createHttpError.NotFound())

  if (String(oldUser.roleId) === '63dc7b68263af3cb70861f0d')
    setIds.roleId = address.blockRoleId

  const newUser = await db
    .collection(DbCollections.USERS)
    .findOneAndUpdate(
      { _id: new ObjectId(req.auth.id) },
      { $set: setIds },
      { returnDocument: 'after' }
    )

  if (!newUser.value)
    return next(createHttpError.InternalServerError())

  return res.send(newUser.value)
}