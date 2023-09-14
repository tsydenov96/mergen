import { getDb } from '../../services/mongodb'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { User } from '../../utils/validators'
import { DbCollections } from '../../config/enums'
import { ObjectId } from 'mongodb'
import { JWT_SECRET_KEY } from '../../config/config'


export const me: RequestHandler<
  never,
  { token: string, user: Partial<User> },
  never,
  never
> = async (req, res, next) => {
  const _id = req.auth.id
  const db = await getDb()

  const user = await db
    .collection(DbCollections.USERS)
    .findOne({
      _id: new ObjectId(_id)
    })

  if (!user)
    return next(new createHttpError.NotFound())

  const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY)

  delete user['password']

  return res.send({
    token,
    user
  })
}