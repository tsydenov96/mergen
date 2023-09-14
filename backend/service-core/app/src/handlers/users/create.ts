import bcrypt from 'bcrypt'
import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { User } from '../../utils/validators'
import { BCRYPT_SALT } from '../../config/config'
import { DbCollections, ServerMessages } from '../../config/enums'


export const create: RequestHandler<
  unknown,
  User,
  Omit<User, '_id' | 'createdAt' | 'updatedAt'>,
  {}
> = async (req, res, next) => {
  const user = req.body
  const db = await getDb()
  if (!user.password)
    return next(createHttpError.BadRequest(ServerMessages.PASSWORD_REQUIRED))
  user.password = await bcrypt.hash(user.password, BCRYPT_SALT)
  const createdAt = Date.now()
  const upserted = await db
    .collection(DbCollections.USERS)
    .updateOne(
      { email: user.email },
      {
        $setOnInsert: {
          ...user,
          createdAt,
          updatedAt: createdAt,
        }
      },
      { upsert: true }
    )

  if (!upserted.upsertedId)
    return next(createHttpError.BadRequest(ServerMessages.EMAIL_EXISTS))

  delete user['password']

  return res.send({
    ...user,
    _id: upserted.upsertedId,
    createdAt,
    updatedAt: createdAt,
  })
}