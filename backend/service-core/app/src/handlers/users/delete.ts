import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { User } from '../../utils/validators'
import createHttpError from 'http-errors'
import { ObjectId, WithId } from 'mongodb'
import { DbCollections } from '../../config/enums'

export const remove: RequestHandler<
  { id: string },
  WithId<User>,
  never,
  never
> = async (req, res, next) => {
  const { id } = req.params
  const db = await getDb()

  let usr = await db
    .collection(DbCollections.USERS)
    .findOneAndDelete({
      _id: new ObjectId(id)
    })

  if (!usr.value)
    return next(createHttpError.NotFound())

  delete usr.value['password']

  return res.send(usr.value)
}