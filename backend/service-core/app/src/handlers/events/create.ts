import { getDb } from '../../services/mongodb'
import { Event } from '../../utils/validators'
import { ObjectId } from 'mongodb'
import { DbCollections, DeviceStatus } from '../../config/enums'


export const createEvent = async (data: { deviceId: string; userId: string; time: number; deviceStatus: DeviceStatus, success: boolean }): Promise<Event | undefined> => {
  try {
    const db = await getDb()

    const device = await db
      .collection(DbCollections.DEVICES)
      .findOne({
        _id: new ObjectId(data.deviceId)
      })

    if (!device) return

    const user = await db
      .collection(DbCollections.USERS)
      .findOne({
        _id: new ObjectId(data.userId)
      })

    if (!user) return

    const insertResult = await db
      .collection(DbCollections.EVENTS)
      .insertOne({
        device,
        deviceId: device._id,
        user,
        userId: user._id,
        time: data.time,
        success: data.success,
        createdAt: Date.now(),
        deviceStatus: data.deviceStatus,
      })

    const newData = await db
      .collection(DbCollections.EVENTS)
      .findOne({
        _id: new ObjectId(insertResult.insertedId)
      })

    return newData as Event
  } catch (err) {
    console.log(err);
    return
  }
}