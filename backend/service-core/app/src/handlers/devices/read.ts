import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Filter, ObjectId, WithId } from 'mongodb'
import { DbCollections, DeviceStatus } from '../../config/enums'
import { getDb } from '../../services/mongodb'
import { ReadLocals } from '../../types'
import { Address, Device, DeviceList } from '../../utils/validators'

export const filter: RequestHandler<
  never,
  never,
  never,
  DeviceList,
  ReadLocals<DbCollections.DEVICES>
> = async (req, res, next) => {
  const {
    status,
  } = req.query
  const filter: Filter<Device> = {}

  if (status) filter.status = { $in: status as DeviceStatus[] }

  res.locals.filter = filter

  return next()
}


export const getDevices: RequestHandler<
  never,
  { data: (Device & { address?: WithId<Address> })[], total: number, page: number },
  never,
  DeviceList,
  ReadLocals<DbCollections.DEVICES>
> = async (_, res, next) => {
  try {
    if (!res.locals.readResult)
      return next(createHttpError.InternalServerError())
    const {
      data,
      total,
      page,
    } = res.locals.readResult
    const db = await getDb()
    const addressIds: Set<string> = new Set()

    for (const d of data)
      if (d.addressId)
        addressIds.add(String(d.addressId))

    const addresses = await db
      .collection(DbCollections.ADDRESSES)
      .find({
        _id: {
          $in: Array.from(addressIds).map(x => new ObjectId(x))
        }
      })
      .toArray()

    const newData: (Device & { address?: WithId<Address> })[] = []

    for (const d of data)
      newData.push({
        ...d,
        address: addresses.filter(x => String(x._id) == String(d.addressId)).at(0)
      })

    return res.send({
      data: newData,
      total,
      page,
    })
  } catch (e) {
    console.error(e);
    return next(createHttpError.InternalServerError())
  }
}