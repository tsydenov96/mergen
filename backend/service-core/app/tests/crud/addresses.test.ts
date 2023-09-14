import 'jest'
import { BASE_API } from "../../src/config/config"
import { DbCollections } from '../../src/config/enums'
import { getDb } from '../../src/services/mongodb'
import { Address, addressSchema } from '../../src/utils/validators'
import { reqApp, token } from '../cfg'

const authToken = `Bearer ${token}`

function addressesTests() {
  describe('CRUD /addresses', () => {
    let address1: Address
    let address2: Address

    it('POST address 1', async () => {
      const createRes1 = await reqApp
        .post(BASE_API + '/addresses')
        .set('Authorization', authToken)
        .send({
          "name": "test_address_1",
        }).expect(200)
      address1 = addressSchema.parse(createRes1.body)
    })

    it('POST address 2', async () => {
      const createRes2 = await reqApp
        .post(BASE_API + '/addresses')
        .set('Authorization', authToken)
        .send({
          "name": "test_address_2",
        }).expect(200)

      address2 = addressSchema.parse(createRes2.body)
    })


    it('GET', async () => {
      const addressId1 = address1._id
      const addressId2 = address2._id
      const readRes = await reqApp
        .get(BASE_API + '/addresses')
        .set('Authorization', authToken)
        .query({
          _id: `${String(addressId1)},${String(addressId2)}`,
        }).expect(200)

      expect(readRes.body.data).toEqual([
        JSON.parse(JSON.stringify(address1)),
        JSON.parse(JSON.stringify(address2)),
      ])
    })


    it('UPDATE', async () => {
      const addressId1 = address1._id
      const updateRes = await reqApp
        .put(BASE_API + `/addresses/${String(addressId1)}`)
        .set('Authorization', authToken)
        .send({
          ...address1,
          name: 'test_address_test'
        }).expect(200)

      expect(updateRes.body).toEqual({
        ...JSON.parse(JSON.stringify(address1)),
        name: 'test_address_test',
        updatedAt: updateRes.body.updatedAt
      })
    })


    it('DELETE address 1', async () => {
      const addressId1 = address1._id

      await reqApp
        .delete(BASE_API + `/addresses/${String(addressId1)}`)
        .set('Authorization', authToken)
        .expect(200)
    })

    it('DELETE address 2', async () => {
      const addressId2 = address2._id
      await reqApp
        .delete(BASE_API + `/addresses/${String(addressId2)}`)
        .set('Authorization', authToken)
        .expect(200)
    })

    afterAll(async () => {
      const db = await getDb()
      if (db.databaseName.includes('-test')) {
        await db.collection(DbCollections.ADDRESSES).drop()
      }
    }, 10000)
  })
}

addressesTests()