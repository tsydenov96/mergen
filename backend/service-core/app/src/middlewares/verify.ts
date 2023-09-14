import { RequestHandler } from 'express'
import { expressjwt } from 'express-jwt'
import { BASE_API, JWT_SECRET_KEY } from '../config/config'

const ver: RequestHandler = (req, res, next) => {
  if ([BASE_API + '/login',
  BASE_API + '/register',
  BASE_API + '/resend'].includes(req.url))
    return next()
  
  if (req.url.startsWith(BASE_API + '/verify'))
    return next()

  if (req.url.startsWith(BASE_API))
    return expressjwt({ secret: JWT_SECRET_KEY, algorithms: ['HS256'] })(req, res, next)

  return next()
}

export default ver