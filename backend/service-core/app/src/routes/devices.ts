import express from 'express'

import { create, getDevices, update, remove, control } from '../handlers/devices'
import { deviceBodySchema, deviceListSchema } from '../utils/validators'
import { validateBody, validateQuery } from '../middlewares/validate-request'
import { checkResources, getResources } from '../middlewares/access-control'
import { AccessConrtolActions, AccessControlKinds, DbCollections, DeviceStatus } from '../config/enums'
import { read } from '../middlewares/read'
import { filter } from '../handlers/devices/read'
import asyncHandler from 'express-async-handler'
import { z } from 'zod'

const router = express.Router()

router.get(
  '/',
  validateQuery(deviceListSchema),
  getResources({ kind: AccessControlKinds.DEVICE }),
  filter,
  read(DbCollections.DEVICES),
  getDevices,
)

router.post(
  '/',
  validateBody(deviceBodySchema),
  checkResources({ kind: AccessControlKinds.DEVICE, resources: ['*'] }),
  asyncHandler(create),
)

router.put(
  '/:id',
  validateBody(deviceBodySchema),
  checkResources({ kind: AccessControlKinds.DEVICE }),
  asyncHandler(update),
)

router.delete(
  '/:id',
  checkResources({ kind: AccessControlKinds.DEVICE }),
  asyncHandler(remove),
)

router.post(
  '/control/:id',
  validateBody(z.object({ command: z.nativeEnum(DeviceStatus) })),
  checkResources({ kind: AccessControlKinds.DEVICE, actions: [AccessConrtolActions.CONTROL] }),
  asyncHandler(control)
)

export default express.Router().use('/devices', router)