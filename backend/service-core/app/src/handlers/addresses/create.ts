import bcrypt from 'bcrypt'
import { getDb } from '../../services/mongodb'
import { RequestHandler } from 'express'
import { Address, Device, DeviceBody, User } from '../../utils/validators'
import createHttpError from 'http-errors'
import { AccessConrtolActions, AccessControlKinds, DbCollections, DeviceStatus, ServerMessages } from '../../config/enums'
import { ObjectId } from 'mongodb'
import { randStr } from '../../utils/rand-sequence'
import { sendAdminNotification } from '../../utils/sendmail'
import { BCRYPT_SALT } from '../../config/config'


export const create: RequestHandler<
  never,
  Address,
  Omit<Address, '_id' | 'createdAt' | 'updatedAt' | 'devices'> & { adminMail?: string, devices?: (DeviceBody | ObjectId)[] },
  never
> = async (req, res, next) => {
  try {
    const data = req.body
    let { devices } = req.body
    console.log(req.body.devices);

    const { adminMail } = req.body
    delete data['adminMail']
    delete data['devices']

    const deviceObjIds: ObjectId[] = []
    const devicesBody: DeviceBody[] = []

    for (let d of devices ?? []) {
      if (d instanceof ObjectId)
        deviceObjIds.push(d)
      else
        devicesBody.push(d)
    }

    const db = await getDb()
    const existing = await db
      .collection(DbCollections.ADDRESSES)
      .findOne({ name: data.name })

    if (existing)
      return next(createHttpError.BadRequest(ServerMessages.NAME_EXISTS))

    let createdAt = Date.now()
    if (devicesBody.length) {
      const dvs: Omit<Device, '_id'>[] = []
      console.log('DEVICE LISTS:');
      console.log(devicesBody);
      console.log(deviceObjIds);


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

      const existingDevices = await db
        .collection(DbCollections.DEVICES)
        .find({ name: { $in: dvs.map(x => x.name) } })
        .toArray()

      if (existingDevices.length > 0)
        return next(createHttpError.BadRequest('[children]: ' + ServerMessages.NAME_EXISTS))

      const insertRes = await db
        .collection(DbCollections.DEVICES)
        .insertMany(dvs)

      deviceObjIds.push(...Object.values(insertRes.insertedIds))
    }

    createdAt = Date.now()
    const rules: any = {}

    for (let k of Object.keys(AccessControlKinds))
      rules[k] = [];

    const roleTimestamps = {
      createdAt,
      updatedAt: createdAt,
    }

    const deviceRule = {
      DEVICE: [
        {
          actions: [AccessConrtolActions.CONTROL, AccessConrtolActions.READ],
          resources: [...deviceObjIds]
        }
      ]
    }

    const userRule = {
      USER: [
        {
          actions: [AccessConrtolActions.PERMIT, AccessConrtolActions.READ],
          resources: []
        }
      ]
    }

    const maybeRoles = await db
      .collection(DbCollections.ROLES)
      .insertMany([
        {
          name: data.name + ' Admin',
          rules: {
            ...rules,
            ...userRule,
            ...deviceRule,
            MENU: [{
              actions: ["READ"],
              resources: [
                "6396be20b32e74798df713a2", //DEVICES
                "6396be85b32e74798df713a4", //USERS
              ]
            }]
          },
          ...roleTimestamps,
        },
        {
          name: data.name + ' Accessed',
          rules: {
            ...rules,
            ...deviceRule,
          },
          ...roleTimestamps,
        },
        {
          name: data.name + ' Blocked',
          rules: {
            ...rules,
            DEVICE: [
              {
                actions: [AccessConrtolActions.READ],
                resources: [...deviceObjIds]
              }
            ],
          },
          ...roleTimestamps,
        }
      ])

    if (maybeRoles.insertedCount != 3)
      return next(createHttpError.InternalServerError())

    const adminRoleId = maybeRoles.insertedIds[0]
    const accessRoleId = maybeRoles.insertedIds[1]
    const blockRoleId = maybeRoles.insertedIds[2]

    createdAt = Date.now()
    const insertData = {
      ...data,
      devices: deviceObjIds,
      adminRoleId,
      accessRoleId,
      blockRoleId,
      createdAt,
      updatedAt: createdAt,
    }
    const created = await db
      .collection(DbCollections.ADDRESSES)
      .insertOne({ ...insertData })

    const newAddress: Address = {
      _id: created.insertedId,
      ...insertData,
    }

    try {
      let adminExists = await db
        .collection(DbCollections.USERS)
        .findOne({ email: adminMail })


      if (adminExists) {
        db.collection(DbCollections.USERS)
          .updateOne(
            { _id: adminExists._id },
            {
              $set: {
                addressId: created.insertedId,
                hasAccess: true,
                roleId: adminRoleId,
                updatedAt: createdAt,
              }
            }
          )
        adminExists.password = undefined
      } else {
        createdAt = Date.now()
        const password = randStr(10)
        const encryptedPassword = await bcrypt.hash(password, BCRYPT_SALT)
        const insertRes = await db
          .collection(DbCollections.USERS)
          .insertOne({
            name: newAddress.name + ' Admin',
            email: adminMail!,
            password: encryptedPassword,
            addressId: created.insertedId,
            hasAccess: true,
            roleId: adminRoleId,
            createdAt,
            updatedAt: createdAt,
          })
        adminExists = {
          _id: insertRes.insertedId,
          name: newAddress.name + ' Admin',
          email: adminMail!,
          password: password,
          hasAccess: true,
          roleId: new ObjectId(),
          createdAt: 0,
          updatedAt: 0,
        }
      }

      sendAdminNotification(adminExists, newAddress)

      if (deviceObjIds.length > 0) {
        db.collection(DbCollections.DEVICES)
          .updateMany(
            { _id: { $in: deviceObjIds } },
            { $set: { addressId: created.insertedId } }
          )
      }


      db.collection(DbCollections.ROLES)
        .updateMany(
          { _id: { $in: [adminRoleId, accessRoleId, blockRoleId] } },
          {
            $set: {
              "rules.ADDRESS": [{ actions: [AccessConrtolActions.READ], resources: [created.insertedId] }]
            }
          }
        )

    } catch (e) {
      console.error(e)
      return next(e)
    }

    return res.send(newAddress)
  } catch (e) {
    return next(e)
  }
}