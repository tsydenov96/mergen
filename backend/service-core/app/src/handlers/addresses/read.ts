import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { DbCollections } from '../../config/enums'
import { ReadLocals } from '../../types'
import { Address, AddressList } from '../../utils/validators'

export const filter: RequestHandler<
  unknown,
  createHttpError.HttpError,
  never,
  AddressList,
  ReadLocals<DbCollections.ADDRESSES>
> = async (_, res, next) => {
  const filter: any = {}
  res.locals.filter = filter

  return next()
}


export const getAddresses: RequestHandler<
  any,
  { data: (Address)[], total: number, page: number },
  never,
  AddressList,
  ReadLocals<DbCollections.ADDRESSES>
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