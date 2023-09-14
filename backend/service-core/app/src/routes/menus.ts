import express from 'express'

import { menus } from '../handlers/menus'
import { menuListSchema } from '../utils/validators'
import { validateQuery } from '../middlewares/validate-request'
import { getResources } from '../middlewares/access-control'
import { AccessControlKinds } from '../config/enums'

const router = express.Router()

router.get(
  '/',
  getResources({ kind: AccessControlKinds.MENU }),
  validateQuery(menuListSchema),
  menus,
)

export default express.Router().use('/menus', router)
