import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { ObjectId, WithId } from "mongodb";
import { getDb } from "../services/mongodb";
import { DbCollections } from "../config/enums";
import { ResourceList } from "../utils/validators/lists";
import { CollectionResource, ReadLocals } from "../types";
import { kDebug } from "../config/config";


export const read = <T extends DbCollections>(collection: T): RequestHandler<
  unknown,
  createHttpError.HttpError | unknown,
  never,
  ResourceList,
  ReadLocals<T>
> => async (req, res, next) => {
  try {
    const {
      _id,
      name,
      sort,
      desc,
      from,
      to,
      limit,
      page
    } = req.query

    const filter = res.locals.filter ?? {}
    const projection = res.locals.project ? res.locals.project : {}
    const resources = res.locals.context.resources

    if (_id)
      filter.$and = [
        { _id: { $nin: [new ObjectId('5a11ce11828279756B696E79'), new ObjectId('ff11c4ca113edadd7bad9141')] } },
        { _id: { $in: _id } },
        resources?.includes('*')
          ? {}
          : { _id: { $in: resources?.map(v => new ObjectId(v)) } }
      ]
    else
      filter._id = {
        $nin: [new ObjectId('5a11ce11828279756B696E79'), new ObjectId('ff11c4ca113edadd7bad9141')]
      }

    if (name) filter.name = { $in: name }
    if (from) filter.createdAt.$gte = new Date(from)
    if (to) filter.createdAt.$lte = new Date(to)

    const _sort: Record<string, 1 | -1> = {}
    if (sort) _sort[sort] = desc ? 1 : -1


    const offset = (page - 1) * limit

    const db = await getDb()

    const count = await db
      .collection(collection)
      .countDocuments()

    const result = await db
      .collection(collection)
      .find(filter)
      .project<WithId<CollectionResource<T>>>(projection)
      .sort(_sort)
      .limit(limit)
      .skip(offset)
      .toArray()

    res.locals.readResult = {
      data: result,
      total: count,
      page,
    }

    return next()
  } catch (e) {
    console.error(`[READ ERROR] ${e}`);

    const internalError = new createHttpError.InternalServerError()
    return res
      .status(internalError.statusCode)
      .send(kDebug ? e : internalError)
  }
}