import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { ObjectId } from 'mongodb'
import { getDb } from '../../services/mongodb'
import { DbCollections } from '../../config/enums'
import { MenuList } from '../../utils/validators'
import { Menu } from '../../utils/validators/resources'

export const getMenus: RequestHandler<
  never,
  { data: Menu[] },
  never,
  MenuList
> = async (req, res, next) => {
  const {
    _id,
    name,
  } = req.query
  try {
    const filter: any = {}

    if (name) filter.name = { $in: name }
    if (_id) filter._id = { $in: _id }

    const db = await getDb()

    const result = await db
      .collection(DbCollections.MENUS)
      .find(filter)
      .toArray()

    return res.send({ data: result })
  } catch (e) {
    console.error(e);
    return next(createHttpError.InternalServerError())
  }
}
