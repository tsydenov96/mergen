import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Address, Device, DeviceBody } from '../../utils/validators'
import { ObjectId } from 'mongodb'
import createHttpError from 'http-errors'
import { DbCollections, DeviceStatus } from '../../config/enums'
import { isSame } from '../../utils/compare-arrays'

export const update: RequestHandler<
  { id: string },
  Address,
  Omit<Address, '_id' | 'createdAt' | 'updatedAt' | 'devices'> & { devices?: (DeviceBody | ObjectId)[] },
  never
> = async (req, res, next) => {
  const address = req.body
  let { devices } = req.body
  delete address['devices']

  const { id } = req.params
  const addressId = new ObjectId(id)

  const deviceObjs: ObjectId[] = []
  const devicesBody: DeviceBody[] = []

  for (let d of devices ?? []) {
    if (!(d instanceof ObjectId))
      devicesBody.push(d)
    else
      deviceObjs.push(d)
  }

  const db = await getDb()

  if (devicesBody.length) {
    const mabyAddress = await db
      .collection(DbCollections.ADDRESSES)
      .findOne({ _id: addressId })
    if (!mabyAddress)
      return next(createHttpError.NotFound())

    const createdAt = Date.now()
    const dvs: Omit<Device, '_id'>[] = []

    for (let d of devicesBody) {
      dvs.push({
        name: d.name,
        topic: d.topic,
        lastMsgTime: 0,
        online: false,
        ping: NaN,
        status: DeviceStatus.CLOSE,
        createdAt,
        updatedAt: createdAt,
      })
    }
    const insertRes = await db
      .collection(DbCollections.DEVICES)
      .insertMany(dvs)

    deviceObjs.push(...Object.values(insertRes.insertedIds))
  }

  const updateRes = await db
    .collection(DbCollections.ADDRESSES)
    .findOneAndUpdate(
      { _id: addressId },
      {
        $set: {
          ...address,
          devices: deviceObjs,
          updatedAt: Date.now()
        }
      }
    )
  if (!updateRes.value)
    return next(createHttpError.NotFound())

  const oldAddress = updateRes.value

  res.send({
    ...oldAddress,
    ...address,
    devices: deviceObjs,
  })

  const isDevicesChanged = !isSame(deviceObjs, oldAddress.devices, (a, b) => String(a) === String(b))
  if (isDevicesChanged) {
    const removedDevices = oldAddress.devices.filter(x => !deviceObjs.includes(x))
    const addedDevices = deviceObjs.filter(x => !oldAddress.devices.includes(x))

    const updatedAt = Date.now()

    db.collection(DbCollections.DEVICES)
      .bulkWrite([
        {
          updateMany: {
            filter: { _id: { $in: removedDevices } },
            update: {
              $set: {
                addressId: undefined,
                updatedAt,
              }
            }
          }
        },
        {
          updateMany: {
            filter: { _id: { $in: addedDevices } },
            update: {
              $set: {
                addressId,
                updatedAt,
              }
            }
          }
        },
      ])

    // access and block roles are const for address and must not be changed
    db.collection(DbCollections.ROLES)
      .updateMany(
        { _id: { $in: [oldAddress.accessRoleId, oldAddress.blockRoleId, oldAddress.adminRoleId] } },
        {
          $set: {
            "rules.DEVICE.resources": address.devices
          }
        }
      )
  }
}