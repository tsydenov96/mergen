import { Request } from 'express'
import 'mongodb'

import {
  Address,
  Device,
  Menu,
  Parking,
  Purchase,
  ResourseList,
  Role,
  User,
  Event
} from '../utils/validators'
import { DbCollections } from '../config/enums'
import { Filter, Sort, WithId } from 'mongodb'

declare global {
  namespace Express {
    interface Request {
      auth: { id?: string };
    }
  }
}

export type ReadLocals<T extends DbCollections> = {
  context: { resources?: string[]; permission?: boolean };
  filter?: Filter<CollectionResource<T>> | Record<string, any>;
  sort?: Sort<CollectionResource<T>>;
  project?: { [key in keyof CollectionResource<T>]?: 1 | 0 };
  readResult?: { data: WithId<CollectionResource<T>>[]; total: number; page: number };
}

export interface Registration {
  name: string;
  email: string;
  password: string;
  code: string;
  codeStr: string;
  createdAt: number;
}

export type CollectionResource<T extends DbCollections> = T extends DbCollections.DEVICES ? Device
  : T extends DbCollections.ADDRESSES ? Address
  : T extends DbCollections.MENUS ? Menu
  : T extends DbCollections.EVENTS ? Event
  : T extends DbCollections.ROLES ? Role
  : T extends DbCollections.USERS ? User
  : T extends DbCollections.REGISTRATIONS ? Registration
  : never


declare module "mongodb" {
  interface Db {
    collection<T extends DbCollections>(name: T, collection_options?: CollectionOptions): Collection<CollectionResource<T>>
  }

  interface Collection<TSchema extends Document = Document> {
    insertOne(doc: Omit<TSchema, '_id'>): Promise<InsertOneResult<TSchema>>
  }

  interface Collection<TSchema extends Document = Document> {
    insertMany(doc: Omit<TSchema, '_id'>[]): Promise<InsertManyResult<TSchema>>
  }
}