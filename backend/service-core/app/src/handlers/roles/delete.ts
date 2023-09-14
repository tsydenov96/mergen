import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Role } from '../../utils/validators'
import createHttpError from 'http-errors'
import { ObjectId, WithId } from 'mongodb'
import { DbCollections, ServerMessages } from '../../config/enums'

export const remove: RequestHandler<
  { id: string },
  WithId<Role>,
  never,
  never
> = async (req, res, next) => {
  const { id } = req.params
  const roleId = new ObjectId(id)
  const db = await getDb()

  const maybeAddress = await db
    .collection(DbCollections.ADDRESSES)
    .findOne({
      $or: [
        { accessRoleId: roleId },
        { adminRoleId: roleId },
        { blockRoleId: roleId },
      ]
    })
  
  if (maybeAddress) 
    return next(createHttpError.BadRequest(ServerMessages.DB_STRUCTURE_ALERT))
  
  const deleteRes = await db
    .collection(DbCollections.ROLES)
    .findOneAndDelete({
      _id: roleId
    })

  if (!deleteRes.value)
    return next(createHttpError.NotFound())

  return res.send(deleteRes.value)
}