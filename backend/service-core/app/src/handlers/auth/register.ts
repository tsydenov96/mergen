import bcrypt from 'bcrypt';
import { RequestHandler } from "express"
import { Creds } from "../../utils/validators"
import createHttpError from 'http-errors'
import { randNumStr, randStr } from "../../utils/rand-sequence"
import { DbCollections, ServerMessages } from "../../config/enums"
import { getDb } from "../../services/mongodb"
import { BCRYPT_SALT } from '../../config/config';
import { sendRegisterMail } from '../../utils/sendmail';
import pug from 'pug'

export const register: RequestHandler<
  never,
  { codeStr: string },
  Creds,
  never
> = async (req, res, next) => {
  let {
    name,
    email,
    password
  } = req.body

  const db = await getDb()
  const existingEmail = await db
    .collection(DbCollections.USERS)
    .findOne({ email })

  if (existingEmail)
    return next(new createHttpError.BadRequest(ServerMessages.EMAIL_EXISTS))

  const code = randNumStr(6)
  const codeStr = randStr(40)

  password = await bcrypt.hash(password, BCRYPT_SALT)

  const createdAt = Date.now()

  const insertResult = await db
    .collection(DbCollections.REGISTRATIONS)
    .updateOne(
      { email },
      {
        $setOnInsert: {
          name,
          email,
          password,
          code,
          codeStr,
          createdAt,
        }
      },
      { upsert: true }
    )

  if (!insertResult.upsertedId)
    return next(new createHttpError.BadRequest(ServerMessages.CHECK_EMAIL))

  // const info = render({ email, name, code, codeStr })
  const info = await sendRegisterMail({ email, name, code, codeStr })

  if (!info)
    return next(createHttpError.InternalServerError())

  return res.send({ codeStr });
}

// const render = pug.compileFile('../../assets/email')