import express from 'express'

import { create, filter, getAddresses, update, remove, pick } from '../handlers/addresses'
import { addressBodySchema, addressListSchema, } from '../utils/validators'
import { validateBody, validateQuery } from '../middlewares/validate-request'
import { checkResources, getResources } from '../middlewares/access-control'
import { AccessConrtolActions, AccessControlKinds, DbCollections } from '../config/enums'
import { read } from '../middlewares/read'
import asyncHandler from 'express-async-handler'

const router = express.Router()

router.get(
  '/',
  validateQuery(addressListSchema),
  getResources({ kind: AccessControlKinds.ADDRESS }),
  filter,
  read(DbCollections.ADDRESSES),
  getAddresses,
)

router.post(
  '/',
  validateBody(addressBodySchema),
  checkResources({ kind: AccessControlKinds.ADDRESS, resources: ['*'] }),
  asyncHandler(create),
)

router.put(
  '/:id',
  validateBody(addressBodySchema),
  checkResources({ kind: AccessControlKinds.ADDRESS }),
  asyncHandler(update),
)

router.delete(
  '/:id',
  checkResources({ kind: AccessControlKinds.ADDRESS }),
  asyncHandler(remove),
)

router.post(
  '/pick/:id',
  checkResources({ kind: AccessControlKinds.ADDRESS, actions: [AccessConrtolActions.PICK] }),
  asyncHandler(pick)
)

export default express.Router().use('/addresses', router)