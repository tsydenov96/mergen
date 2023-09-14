import { ObjectId } from "mongodb";
import { z } from "zod"
import {
  addressSchema,
  deviceSchema,
  menuSchema,
  eventSchema,
  roleSchema,
  userSchema
} from "./resources"

const idsPreprocess = z.preprocess(x => String(x).split(',').map(x => new ObjectId(x)), z.array(z.instanceof(ObjectId)));

const listSchema = z.object({
  _id: idsPreprocess,
  name: z.preprocess(x => String(x).split(','), z.array(z.string())),
  from: z.preprocess(x => new Date(String(x)), z.date()),
  to: z.preprocess(x => new Date(String(x)), z.date()),
  sort: z.string(),
})
  .partial()
  .merge(z.object({
    limit: z.preprocess(Number, z.number()).default(20),
    page: z.preprocess(Number, z.number()).default(1),
    desc: z.preprocess(x => x === undefined || x === null || x === 'false' ? false : true, z.boolean()).default(false)
  }))


export const menuListSchema = menuSchema.partial()
  .merge(
    listSchema.omit({
      desc: true,
      from: true,
      to: true,
      limit: true,
      page: true,
    })
  )


export const userListSchema = userSchema.omit({ password: true }).partial().merge(listSchema)
  .merge(
    z.object({
      sort: userSchema.keyof(),
    }).partial(),
  )


export const roleListSchema = roleSchema.partial().merge(listSchema)
  .merge(
    z.object({
      sort: roleSchema.keyof(),
    }).partial()
  )


export const eventListSchema = eventSchema
  .omit({})
  .partial()
  .merge(listSchema)
  .merge(
    z.object({
      deviceId: idsPreprocess,
      userId: idsPreprocess,
      sort: eventSchema.keyof(),
    }).partial(),
  )


export const deviceListSchema = deviceSchema
  .omit({
    lastMsgTime: true,
  })
  .partial()
  .merge(listSchema)
  .merge(
    z.object({
      addressId: idsPreprocess,
      topic: z.preprocess(x => String(x).split(','), z.array(z.string())),
      status: z.preprocess(x => String(x).split(','), z.array(z.string())),
      sort: deviceSchema.keyof(),
    }).partial(),
  )

export const addressListSchema = addressSchema.partial().merge(listSchema)
  .merge(
    z.object({
      sort: addressSchema.keyof(),
    }).partial(),
  )


export type ResourceList = z.infer<typeof listSchema>
export type MenuList = z.infer<typeof menuListSchema>
export type UserList = z.infer<typeof userListSchema>
export type RoleList = z.infer<typeof roleListSchema>
export type EventList = z.infer<typeof eventListSchema>
export type DeviceList = z.infer<typeof deviceListSchema>
export type AddressList = z.infer<typeof addressListSchema>