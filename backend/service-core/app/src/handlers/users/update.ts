import bcrypt from 'bcrypt'
import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { User } from '../../utils/validators'
import { ObjectId, WithId } from 'mongodb'
import createHttpError from 'http-errors'
import { BCRYPT_SALT } from '../../config/config'
import { DbCollections } from '../../config/enums'

export const update: RequestHandler<
  { id: string },
  WithId<User>,
  Omit<User, '_id' | 'createdAt' | 'updatedAt'>,
  never
> = async (req, res, next) => {
  const user = req.body
  const { id } = req.params
  const db = await getDb()

  if (user.password)
    user.password = await bcrypt.hash(user.password, BCRYPT_SALT)

  const updated = await db
    .collection(DbCollections.USERS)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...user,
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )

  if (!updated.value)
    return next(createHttpError.NotFound())

  delete updated.value['password']

  return res.send(updated.value)
}