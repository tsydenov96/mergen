import dotenv from 'dotenv'
import dotenvExp from 'dotenv-expand'

dotenvExp.expand(dotenv.config())

export const APP_ID = process.env.APP_ID || ''

export const kDebug = (process.env.NODE_ENV || '') !== 'production'
export const PORT = process.env.PORT ? Number(process.env.PORT) : 1488
export const MONGO_URL = process.env.MONGO_URL || ''
export const MONGO_DB = process.env.MONGO_DB || ''
export const MONGO_CA = process.env.MONGO_CA || ''
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || ''

export const BASE_API = process.env.BASE_API || '/api/v1'

export const NATS_SERVER_URL = process.env.NATS_SERVER_URL || ''
export const NATS_TOPIC_DEVICE_BASE = process.env.NATS_TOPIC_DEVICE_BASE || ''
export const NATS_TOPIC_DEVICE_CONTROL = process.env.NATS_TOPIC_DEVICE_CONTROL || ''
export const NATS_SUBJECT_VITALS = process.env.NATS_SUBJECT_VITALS || ''

export const NATS_TOPIC_CHECK_ALLOWANCE = process.env.NATS_TOPIC_CHECK_ALLOWANCE || ''
export const NATS_TOPIC_GET_ALLOWED_RESOURCES = process.env.NATS_TOPIC_GET_ALLOWED_RESOURCES || ''
export const NATS_TOPIC_DROP_BALANCE = process.env.NATS_TOPIC_DROP_BALANCE || ''
export const NATS_TOPIC_GET_CARD = process.env.NATS_TOPIC_GET_CARD || ''

export const NATS_CREDS = process.env.NATS_CREDS || ''
export const NODEMAILER_CREDS = process.env.NODEMAILER_CREDS || ''

export const BCRYPT_SALT = 10

export const ROLE_NEW_USER = 'New User'