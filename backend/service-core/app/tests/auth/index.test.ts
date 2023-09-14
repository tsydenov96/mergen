import 'jest'
import { BASE_API, ROLE_NEW_USER } from "../../src/config/config"
import { AccessConrtolActions, DbCollections, ServerMessages } from '../../src/config/enums'
import { getDb } from '../../src/services/mongodb'
import { reqApp } from '../cfg'

function authTests() {
  beforeAll(async () => {
    const db = await getDb()
    if (db.databaseName.includes('-test')) {
      let regPromise
      let usrPromise
      if ((await db.listCollections().toArray()).map(c => c.name).includes(DbCollections.REGISTRATIONS))
        regPromise = db.collection(DbCollections.REGISTRATIONS).drop()
      if ((await db.listCollections().toArray()).map(c => c.name).includes(DbCollections.USERS))
        usrPromise = db.collection(DbCollections.USERS).drop()

      await Promise.all([
        regPromise,
        usrPromise,
        db.collection(DbCollections.ROLES)
          .insertOne({
            name: ROLE_NEW_USER,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            rules: {
              MENU: [],
              USER: [],
              ROLE: [],
              EVENT: [],
              DEVICE: [],
              ADDRESS: [{ actions: [AccessConrtolActions.PICK], resources: ["*"] }],
            }
          })
      ])
    }
  }, 10000)

  describe('Registration flow', () => {
    let codeStr: string = ''
    jest.setTimeout(15000)
    it('POST /register --> success', async () => {
      const regRes = await reqApp
        .post(BASE_API + '/register')
        .send({
          name: 'Steve Rambo',
          email: 'admin@gmail.com',
          password: 'asswecan'
        }).expect(200)

      expect(regRes.body).toHaveProperty('codeStr')
    })

    it('POST /register --> bad request \'Email exists\'', () => {
      return reqApp
        .post(BASE_API + '/register')
        .send({
          name: 'Steve Rambo',
          email: 'admin@gmail.com',
          password: 'asswecan'
        }).expect(400, { message: ServerMessages.CHECK_EMAIL })
    })

    it('POST /resend --> success', async () => {
      const resRes = await reqApp
        .post(BASE_API + '/resend')
        .send({
          name: 'Steve Rambo',
          email: 'admin@gmail.com',
          password: 'asswecan'
        }).expect(200)

      expect(resRes.body).toHaveProperty('codeStr')
      codeStr = resRes.body.codeStr
    })

    it('POST /resend --> bad request', () => {
      return reqApp
        .post(BASE_API + '/resend')
        .send({
          name: 'Steve',
          email: 'minecraft.is.my.life@gmail.com',
          password: 'asswecan'
        }).expect(400)
    })

    it('POST /verify --> success', () => {
      return reqApp
        .post(BASE_API + '/verify')
        .send({ code: "000000", codeStr })
        .expect(200)
    })

    it('POST /verify --> bad request', () => {
      return reqApp
        .post(BASE_API + '/verify')
        .send({ code: "000000", codeStr })
        .expect(400, { message: ServerMessages.REGISTRATION_FAILED })
    })
  })

  describe('Login & token refresh', () => {
    let token: string = ''
    it('POST /login --> success', async () => {
      const loginRes = await reqApp
        .post(BASE_API + '/login')
        .send({
          email: 'admin@gmail.com',
          password: 'asswecan'
        })
        .expect(200)

      token = loginRes.body.token
    })

    it('POST /login --> not found', () => {
      return reqApp
        .post(BASE_API + '/login')
        .send({
          email: 'adminasdasdsad@gmail.com',
          password: 'asswecan'
        })
        .expect(404)
    })

    it('POST /login --> bad request \'wrong password\'', () => {
      return reqApp
        .post(BASE_API + '/login')
        .send({
          email: 'admin@gmail.com',
          password: 'assswecan'
        })
        .expect(403)
    })

    it('POST /me --> success', () => {
      return reqApp
        .post(BASE_API + '/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })

    it('POST /me --> unauthorized', () => {
      return reqApp
        .post(BASE_API + '/me')
        .expect(401)
    })
  })

  afterAll(async () => {
    const db = await getDb()
    if (db.databaseName.includes('-test')) {
      await Promise.all([
        db.collection(DbCollections.REGISTRATIONS).drop(),
        db.collection(DbCollections.USERS).drop(),
        db.collection(DbCollections.ROLES).drop(),
      ])
    }
  }, 10000)
}

authTests()