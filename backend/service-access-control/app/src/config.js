import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

const myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

export const NODE_ENV = process.env.NODE_ENV

export const NATS_SERVER_URL = process.env.NATS_SERVER_URL
export const NATS_CREDS = process.env.NATS_CREDS
export const NATS_TOPIC_BASE = process.env.NATS_TOPIC_BASE
export const NATS_TOPIC_CHECK_ALLOWANCE = process.env.NATS_TOPIC_CHECK_ALLOWANCE
export const NATS_TOPIC_GET_ALLOWED_RESOURCES = process.env.NATS_TOPIC_GET_ALLOWED_RESOURCES

export const MONGO_URL = process.env.MONGO_URL
export const MONGO_DB = process.env.MONGO_DB
export const MONGO_CA = process.env.MONGO_CA


const DEFAULT_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE']

export const KIND_AND_ACTIONS = {
  ADDRESS: ['PICK', ...DEFAULT_ACTIONS],
  DEVICE: ['READ_REPORT', 'CONTROL', ...DEFAULT_ACTIONS],
  EVENT: ['READ_REPORT', 'READ'],
  MENU: ['READ'],
  USER: ['PERMIT', 'GRANT', ...DEFAULT_ACTIONS],
  ROLE: DEFAULT_ACTIONS,
}

export const KIND_AND_DB = {
  ADDRESS: 'addresses',
  DEVICE: 'devices',
  EVENT: 'events',
  MENU: 'menus',
  USER: 'users',
  ROLE: 'roles',
}