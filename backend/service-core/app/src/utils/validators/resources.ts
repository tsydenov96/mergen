import { ObjectId } from "mongodb"
import { z } from "zod"
import { AccessConrtolActions, DeviceStatus } from "../../config/enums"

export const idPreprocess = z.preprocess(x => new ObjectId(String(x)), z.instanceof(ObjectId))
export const emailProcess = z.preprocess(x => String(x).toLowerCase(), z.string().email())

const resourceSchema = z.object({
  _id: idPreprocess,
  name: z.string().trim().regex(/^\S+$/, 'Bad name'),
  updatedAt: z.number(),
  createdAt: z.number(),
})

export const menuSchema = z.object({
  _id: idPreprocess,
  name: z.string()
})


export const userSchema = z.object({
  name: z.string().trim(),
  email: emailProcess,
  password: z.string().optional(),
  roleId: idPreprocess,
  addressId: idPreprocess.optional(),
  hasAccess: z.boolean(), //just for ui, real access controled by role
}).merge(resourceSchema.omit({ name: true }))


const ruleSchema = z.object({
  actions: z.array(z.nativeEnum(AccessConrtolActions)),
  resources: z.array(z.string().or(idPreprocess)),
})

export const roleSchema = z.object({
  name: z.string(),
  rules: z.object({
    MENU: z.array(ruleSchema),
    USER: z.array(ruleSchema),
    ROLE: z.array(ruleSchema),
    EVENT: z.array(ruleSchema),
    DEVICE: z.array(ruleSchema),
    ADDRESS: z.array(ruleSchema),
  }),
}).merge(resourceSchema.omit({ name: true }))


export const deviceSchema = z.object({
  topic: z.string(),

  status: z.nativeEnum(DeviceStatus),
  online: z.boolean(),
  lastMsgTime: z.number(),
  ping: z.number().or(z.nan()),

  lat: z.number().optional(),
  long: z.number().optional(),
  addressId: idPreprocess.optional(),
}).merge(resourceSchema)


export const eventSchema = z.object({
  device: deviceSchema,
  deviceId: idPreprocess,
  user: userSchema,
  userId: idPreprocess,
  deviceStatus: z.nativeEnum(DeviceStatus),
  time: z.number(),
  success: z.boolean(),
}).merge(resourceSchema.omit({ name: true, updatedAt: true }))

export const deviceBodySchema = deviceSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  lastMsgTime: true,
  ping: true,
  online: true,
  status: true
})


export const addressSchema = z.object({
  name: z.string().trim(),
  polygon: z.array(z.object({
    lat: z.number(),
    long: z.number(),
  })).optional(),

  city: z.string().trim(),
  district: z.string().trim(),
  subdistrict: z.string().trim().optional(),
  street: z.string().trim().optional(),
  buildings: z.string().trim().optional(),
  devices: z.array(idPreprocess).default([]),

  //do not show it on UI
  adminRoleId: idPreprocess,
  accessRoleId: idPreprocess,
  blockRoleId: idPreprocess,
}).merge(resourceSchema.omit({ name: true }))


const deviceElementPreprocess = z.preprocess(x => {
  try {
    return new ObjectId(String(x))
  } catch (e) {
    return deviceBodySchema.parse(x)
  }
}, z.instanceof(ObjectId).or(deviceBodySchema))


export const addressBodySchema = addressSchema
  .omit({
    accessRoleId: true,
    blockRoleId: true,
    adminRoleId: true,
    devices: true,
  })
  .merge(z.object({
    adminMail: emailProcess,
    devices: z.array(deviceElementPreprocess).optional()
  }))


export const credsSchema = z.object({
  name: z.string().trim(),
  email: emailProcess,
  password: z.string(),
})

export type Creds = z.infer<typeof credsSchema>
export type Menu = z.infer<typeof menuSchema>
export type User = z.infer<typeof userSchema>
export type Role = z.infer<typeof roleSchema>
export type Event = z.infer<typeof eventSchema>
export type Device = z.infer<typeof deviceSchema>
export type Address = z.infer<typeof addressSchema>
export type DeviceBody = z.infer<typeof deviceBodySchema>