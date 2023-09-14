import express from 'express'

import { create, update, remove, getRoles } from '../handlers/roles'
import { Role, roleListSchema, roleSchema } from '../utils/validators'
import { validateBody, validateQuery } from '../middlewares/validate-request'
import { checkResources, getResources } from '../middlewares/access-control'
import { AccessControlKinds, DbCollections } from '../config/enums'
import { read } from '../middlewares/read'

const router = express.Router()

router.get(
  '/',
  getResources({ kind: AccessControlKinds.ROLE }),
  validateQuery(roleListSchema),
  read(DbCollections.ROLES),
  getRoles,
)

router.post(
  '/',
  checkResources({ kind: AccessControlKinds.ROLE, resources: ['*'] }),
  validateBody(roleSchema),
  create,
)

router.put(
  '/:id',
  checkResources({ kind: AccessControlKinds.ROLE }),
  validateBody(roleSchema),
  update,
)

router.delete(
  '/:id',
  checkResources({ kind: AccessControlKinds.ROLE }),
  remove,
)

export default express.Router().use('/roles', router)