import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Creds, User } from '../../utils/validators'
import { JWT_SECRET_KEY } from '../../config/config'
import { DbCollections, ServerMessages } from '../../config/enums'


export const login: RequestHandler<
  never,
  { token: string, user: User },
  Omit<Creds, 'name'>,
  never
> = async (req, res, next) => {
  const { email, password } = req.body

  const db = await getDb()

  const user = await db
    .collection(DbCollections.USERS)
    .findOne({
      email
    })

  if (!user)
    return next(new createHttpError.NotFound(ServerMessages.USER_NOT_FOUND))

  if (!(await bcrypt.compare(password, user.password ?? '')))
    return next(new createHttpError.Forbidden(ServerMessages.WRONG_CREDS))

  const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY)

  delete user['password']

  return res
    .send({
      token,
      user,
    })
}