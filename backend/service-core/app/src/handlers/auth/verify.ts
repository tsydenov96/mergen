import { RequestHandler } from "express"
import createHttpError from 'http-errors'
import { DbCollections, ServerMessages } from "../../config/enums"
import { getDb } from "../../services/mongodb"
import { Filter } from 'mongodb';
import { Registration } from "../../types";
import { kDebug, ROLE_NEW_USER } from "../../config/config";

export const verify: RequestHandler<
  { code: string, codeStr: string },
  void,
  never,
  never
> = async (req, res, next) => {
  const codes = req.params
  let filter: Filter<Registration> = {}
  filter.code = codes.code
  filter.codeStr = codes.codeStr

  if (kDebug && codes.code === '000000') {
    delete filter['code']
  }

  const db = await getDb()
  const regObj = await db
    .collection(DbCollections.REGISTRATIONS)
    .findOne(filter)

  if (!regObj)
    return next(new createHttpError.BadRequest(ServerMessages.REGISTRATION_FAILED))

  const role = await db
    .collection(DbCollections.ROLES)
    .findOne({
      name: ROLE_NEW_USER
    })

  if (!role)
    return next(createHttpError.InternalServerError(ServerMessages.ROLE_NOT_FOUND))

  const createdAt = Date.now()
  const insertResult = await db
    .collection(DbCollections.USERS)
    .updateOne(
      { email: regObj.email },
      {
        $setOnInsert: {
          name: regObj.name,
          email: regObj.email,
          password: regObj.password,
          roleId: role._id,
          createdAt,
          updatedAt: createdAt,
        }
      },
      { upsert: true }
    )

  if (!insertResult.upsertedId)
    return next(new createHttpError.InternalServerError())

  db.collection(DbCollections.REGISTRATIONS)
    .deleteOne(filter)

  return res.send()
  // return res.render('pug', { f })
}