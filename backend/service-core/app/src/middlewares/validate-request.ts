import { NextFunction, Request, Response } from "express"
import { ZodObject, ZodRawShape, ZodSchema } from "zod"

export const validateBody = <T extends ZodRawShape>(schema: ZodObject<ZodRawShape>) => (
  req: Request<unknown, T, unknown, unknown>,
  _: Response,
  next: NextFunction,
) => {
  try {
    const bodySchema = schema
      .omit({
        _id: true,
        createdAt: true,
        updatedAt: true
      })
    const data = bodySchema.parse(req.body)
    req.body = {}
    req.body = { ...data }
    return next()
  } catch (e) {
    console.error(`[VALIDATE BODY] ${e}`);
    return next(e)
  }
}

export const validateQuery = <T>(schema: ZodSchema<T>) => (
  req: Request<unknown, unknown, unknown, T, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = schema.parse(req.query)
    req.query = { ...data }
    return next()
  } catch (e) {
    return next(e)
  }
}