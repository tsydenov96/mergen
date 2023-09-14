import { BSONTypeError } from "bson";
import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "express-jwt";
import createHttpError from "http-errors";
import { MongoError } from "mongodb";
import { ZodError } from "zod";
import { kDebug } from "../config/config";

export const errorHandler = async (err: unknown, req: Request, res: Response, _: NextFunction) => {
  console.log(`[ERROR][${req.method}] [URL: "${req.url}"] Error: ${String(err)}`);
  if (kDebug && 'stack' in (err as any))
    console.error((err as any).stack);

  let httpError: createHttpError.HttpError = new createHttpError.InternalServerError()
  if (err instanceof UnauthorizedError)
    httpError = new createHttpError.Unauthorized(err.message)
  else if (err instanceof createHttpError.HttpError)
    httpError = err
  else if (err instanceof ZodError) {
    console.error(err.stack);
    httpError = new createHttpError.BadRequest()
    err = err.issues
  } else if (err instanceof BSONTypeError) {
    httpError = new createHttpError.BadRequest()

    err = {
      name: err.name,
      message: err.message,
      cause: err.cause,
      stack: err.stack?.split('\n'),
    }
  } else if (err instanceof MongoError) {
    err = {
      name: err.name,
      message: err.message,
      stack: err.stack?.split('\n')
    }
  }

  return res
    .status(httpError.statusCode)
    .send(kDebug ? err : httpError)
}