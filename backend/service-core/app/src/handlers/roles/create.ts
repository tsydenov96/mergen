import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Role } from '../../utils/validators'
import { DbCollections } from '../../config/enums'


export const create: RequestHandler<
  never,
  Role,
  Omit<Role, '_id' | 'createdAt' | 'updatedAt'>,
  never
> = async (req, res, next) => {
  try {
  const role = req.body
  const db = await getDb()

  const createdAt = Date.now()

  const insertRes = await db
    .collection(DbCollections.ROLES)
    .insertOne({
      ...role,
      createdAt,
      updatedAt: createdAt,
    })

  return res.send({
    _id: insertRes.insertedId,
    ...role,
    createdAt,
    updatedAt: createdAt,
  })
  } catch (e) {
    console.error(e);
    return next(e)
  }
}