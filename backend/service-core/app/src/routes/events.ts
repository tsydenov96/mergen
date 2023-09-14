import express from 'express'

import { filter, getEvents } from '../handlers/events'
import { Event, eventListSchema } from '../utils/validators'
import { validateQuery } from '../middlewares/validate-request'
import { getResources } from '../middlewares/access-control'
import { AccessControlKinds, DbCollections } from '../config/enums'
import { read } from '../middlewares/read'

const router = express.Router()

router.get(
  '/',
  getResources({ kind: AccessControlKinds.EVENT }),
  validateQuery(eventListSchema),
  filter,
  read(DbCollections.EVENTS),
  getEvents,
)

export default express.Router().use('/events', router)
