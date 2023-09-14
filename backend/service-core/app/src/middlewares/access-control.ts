import { RequestHandler } from "express"
import createHttpError from "http-errors"
import { checkAllowance, getAllowedResources } from "../services/nats.service"
import { AccessConrtolActions, ServerMessages } from "../config/enums"

const methodToAction = {
  'POST': AccessConrtolActions.CREATE,
  'GET': AccessConrtolActions.READ,
  'PUT': AccessConrtolActions.UPDATE,
  'DELETE': AccessConrtolActions.DELETE,
}

export const getResources = (payload: { kind: string; actions?: AccessConrtolActions[] })
  : RequestHandler<unknown, unknown, unknown, unknown, { context: { resources?: string[] } }> =>
  async (req, res, next) => {
    if (!payload.actions)
      if (req.method in methodToAction)
        payload.actions = [methodToAction[req.method as keyof typeof methodToAction]]

    const { resources } = await getAllowedResources({
      kind: payload.kind,
      actions: payload.actions ?? [],
      userId: req.auth.id!
    })

    res.locals.context = { resources: resources }
    return next()
  }

export const checkResources =
  (payload: { kind: string; actions?: AccessConrtolActions[], resources?: string[] })
    : RequestHandler<{ id: string }, unknown, unknown, unknown> =>
    async (req, _, next) => {
      if (!payload.actions)
        if (req.method in methodToAction)
          payload.actions = [methodToAction[req.method as keyof typeof methodToAction]]

      if (!payload.resources)
        if (['PUT', 'DELETE'].includes(req.method) || (req.params && req.params.id))
          payload.resources = [req.params.id]

      const { allowance } = await checkAllowance({
        kind: payload.kind,
        actions: payload.actions ?? [],
        resources: payload.resources ?? [],
        userId: req.auth.id ?? '',
      })

      if (!allowance)
        return next(createHttpError.Forbidden(ServerMessages.ACCESS_DENIED))

      return next()
    }