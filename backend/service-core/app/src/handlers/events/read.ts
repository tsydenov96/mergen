import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Filter } from 'mongodb'
import { DbCollections } from '../../config/enums'
import { ReadLocals } from '../../types'
import { Event, EventList } from '../../utils/validators'

export const filter: RequestHandler<
  unknown,
  createHttpError.HttpError, never,
  EventList,
  ReadLocals<DbCollections.EVENTS>
> = async (req, res, next) => {
  const {
    deviceId,
    userId,
  } = req.query

  const filter: Filter<Event> = {}

  if (deviceId) filter.device = { _id: { $in: deviceId } }
  if (userId) filter.user = { _id: { $in: userId } }

  res.locals.filter = filter

  return next()
}

export const getEvents: RequestHandler<
  unknown,
  { data: Event[], total: number, page: number },
  never,
  EventList
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
