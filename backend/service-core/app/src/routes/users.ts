import express from 'express'
import { z } from 'zod'

import { create, getUsers, update, remove, permit, filter, grant } from '../handlers/users'
import { idPreprocess, userListSchema, userSchema } from '../utils/validators'
import { validateBody, validateQuery } from '../middlewares/validate-request'
import { checkResources, getResources } from '../middlewares/access-control'
import { AccessConrtolActions, AccessControlKinds, DbCollections } from '../config/enums'
import { read } from '../middlewares/read'
import asyncHandler from "express-async-handler"

const router = express.Router()

router.get(
  '/',
  getResources({ kind: AccessControlKinds.USER }),
  validateQuery(userListSchema),
  filter,
  read(DbCollections.USERS),
  getUsers,
)

router.post(
  '/',
  checkResources({ kind: AccessControlKinds.USER, resources: ['*'] }),
  validateBody(userSchema),
  asyncHandler(create),
)

router.put(
  '/:id',
  checkResources({ kind: AccessControlKinds.USER }),
  validateBody(userSchema),
  asyncHandler(update),
)

router.delete(
  '/:id',
  checkResources({ kind: AccessControlKinds.USER }),
  asyncHandler(remove),
)


router.put(
  '/permit/:id',
  checkResources({ kind: AccessControlKinds.USER, actions: [AccessConrtolActions.PERMIT] }),
  validateBody(z.object({ access: z.boolean() })),
  asyncHandler(permit),
)

router.put(
  '/grant/:id',
  checkResources({ kind: AccessControlKinds.USER, actions: [AccessConrtolActions.PERMIT] }),
  validateBody(z.object({ addressId: idPreprocess })),
  asyncHandler(grant),
)

export default express.Router().use('/users', router)