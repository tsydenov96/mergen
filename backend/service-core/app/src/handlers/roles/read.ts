import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { DbCollections } from '../../config/enums'
import { ReadLocals } from '../../types'
import { Role, RoleList } from '../../utils/validators'

export const getRoles: RequestHandler<
  never,
  { data: Role[], total: number, page: number } | createHttpError.HttpError | unknown,
  never,
  RoleList,
  ReadLocals<DbCollections.ROLES>
> = async (_, res, next) => {
  try {
    if (!res.locals.readResult)
      return next(createHttpError.InternalServerError())
    const {
      data,
      total,
      page,
    } = res.locals.readResult

    return res.send({
      data,
      total,
      page,
    })
  } catch (e) {
    console.error(e);
    return next(createHttpError.InternalServerError())
  }
}