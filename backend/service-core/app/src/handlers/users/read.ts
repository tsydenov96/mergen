import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Filter } from 'mongodb'
import { DbCollections } from '../../config/enums'
import { ReadLocals } from '../../types'
import { User, UserList } from '../../utils/validators'

export const filter: RequestHandler<
  never,
  never,
  unknown,
  UserList,
  ReadLocals<DbCollections.USERS>
> = async (req, res, next) => {
  const {
    email
  } = req.query

  const filter: Filter<User> = {}

  if (email) filter.email = { $in: email.split(',') }

  res.locals.filter = filter
  res.locals.project = { password: 0 }

  return next()
}


export const getUsers: RequestHandler<
  never,
  { data: User[], total: number, page: number },
  unknown,
  UserList,
  ReadLocals<DbCollections.USERS>
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