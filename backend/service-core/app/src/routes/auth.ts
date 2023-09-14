import express from 'express'

import { me, login, verify, register, resend } from '../handlers/auth'
import { credsSchema } from '../utils/validators'
import { validateBody } from '../middlewares/validate-request'
import asyncHandler from "express-async-handler"

const router = express.Router()

router
  .post('/me', asyncHandler(me))
  .post('/login', validateBody(credsSchema.omit({ name: true })), asyncHandler(login))
  .get('/verify/:codeStr/:code', asyncHandler(verify))
  .post('/register', validateBody(credsSchema), asyncHandler(register))
  .post('/resend', validateBody(credsSchema), asyncHandler(resend))

export default router