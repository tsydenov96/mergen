import 'jest'
import { BASE_API } from "../../src/config/config"
import { DbCollections } from '../../src/config/enums'
import { getDb } from '../../src/services/mongodb'
import { Device, deviceSchema } from '../../src/utils/validators'
import { reqApp, token } from '../cfg'

const authToken = `Bearer ${token}`

function devicesTests() {
  describe('CRUD /devices', () => {
    let device1: Device
    let device2: Device
    let device3: Device

    it('POST device 1', async () => {
      const createRes1 = await reqApp
        .post(BASE_API + '/devices')
        .set('Authorization', authToken)
        .send({
          name: "test_device_1",
          topic: "1488",
        }).expect(200)

      device1 = deviceSchema.parse(createRes1.body)
    })
    it('POST device 2', async () => {
      const createRes2 = await reqApp
        .post(BASE_API + '/devices')
        .set('Authorization', authToken)
        .send({
          name: "test_device_2",
          topic: "123"
        }).expect(200)

      device2 = deviceSchema.parse(createRes2.body)
    })

    it('POST device 3', async () => {

      const createRes3 = await reqApp
        .post(BASE_API + '/devices')
        .set('Authorization', authToken)
        .send({
          name: "test_device_3",
          topic: "1234",
        }).expect(200)

      device3 = deviceSchema.parse(createRes3.body)
    })

    it('GET', async () => {
      const readResSortPrice = await reqApp
        .get(BASE_API + '/devices')
        .set('Authorization', authToken)
        .query({
          _id: `${String(device1._id)},${String(device2._id)},${String(device3._id)}`,
        }).expect(200)

      expect(readResSortPrice.body).toEqual({
        ...readResSortPrice.body,
        data: [
          JSON.parse(JSON.stringify(device1)),
          JSON.parse(JSON.stringify(device2)),
          JSON.parse(JSON.stringify(device3)),
        ]
      })
    })



    it('GET desc', async () => {
      const readResSortPriceDesc = await reqApp
        .get(BASE_API + '/devices')
        .set('Authorization', authToken)
        .query({
          _id: `${String(device1._id)},${String(device2._id)},${String(device3._id)}`,
          sort: 'createdAt',
          desc: true
        }).expect(200)

      expect(readResSortPriceDesc.body).toEqual({
        ...readResSortPriceDesc.body,
        data: [
          JSON.parse(JSON.stringify(device3)),
          JSON.parse(JSON.stringify(device2)),
          JSON.parse(JSON.stringify(device1)),
        ]
      })
    })


    it('DELETE device 1', async () => {
      await reqApp
        .delete(BASE_API + `/devices/${String(device1._id)}`)
        .set('Authorization', authToken)
        .expect(200)
    })
    it('DELETE device 2', async () => {
      await reqApp
        .delete(BASE_API + `/devices/${String(device2._id)}`)
        .set('Authorization', authToken)
        .expect(200)
    })
    it('DELETE device 3', async () => {
      await reqApp
        .delete(BASE_API + `/devices/${String(device3._id)}`)
        .set('Authorization', authToken)
        .expect(200)
    })

    afterAll(async () => {
      const db = await getDb()
      if (db.databaseName.includes('-test')) {
        await db.collection(DbCollections.DEVICES).drop()
      }
    }, 10000)
  })
}

devicesTests()