import bcrypt from 'bcrypt';
import { RequestHandler } from "express"
import { Creds } from "../../utils/validators"
import createHttpError from 'http-errors'
import { randNumStr, randStr } from "../../utils/rand-sequence"
import { DbCollections, ServerMessages } from "../../config/enums"
import { getDb } from "../../services/mongodb"
import { BCRYPT_SALT } from '../../config/config';
import { sendRegisterMail } from '../../utils/sendmail';

export const resend: RequestHandler<
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

  const code = randNumStr(6)
  const codeStr = randStr(40)

  password = await bcrypt.hash(password, BCRYPT_SALT)

  const createdAt = Date.now()
  const updateResult = await db
    .collection(DbCollections.REGISTRATIONS)
    .updateOne(
      { email },
      {
        $set: {
          name,
          email,
          password,
          code,
          codeStr,
          createdAt,
        }
      })

  if (!updateResult.modifiedCount)
    return next(new createHttpError.BadRequest())

  const info = await sendRegisterMail({ email, name, code, codeStr })

  if (!info)
    return next(new createHttpError.InternalServerError(ServerMessages.EMAIL_SERVICE_ERROR))

  return res.send({ codeStr })
}