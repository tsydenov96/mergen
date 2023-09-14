export const enum ServerMessages {
  //bad request
  REGISTRATION_FAILED = 'Registration failed',
  CHECK_EMAIL = 'Check email',
  EMAIL_EXISTS = 'Email already exists',
  NAME_EXISTS = 'Name already exists',
  PASSWORD_REQUIRED = 'Password required',
  DB_STRUCTURE_ALERT = 'DB structure alert',

  //not found
  USER_NOT_FOUND = 'User not found',

  //forbidden
  WRONG_CREDS = 'Wrong login or password',
  ACCESS_DENIED = 'Acccess denied',

  //timeout
  DEVICE_IS_OFFLINE = 'Device is offline',

  //internal
  ROLE_NOT_FOUND = 'Role doesn\'t exists',
  NEW_USER_ROLE_NOT_FOUND = 'Role "ROLE_NEW_USER" doesn\'t exists',
  EMAIL_SERVICE_ERROR = 'Nodemailer error',
  RESOURCE_DOESNT_EXIST = 'Resource doesn\'t exists'
}

export const enum DbCollections {
  MENUS = 'menus',
  USERS = 'users',
  ROLES = 'roles',
  DEVICES = 'devices',
  EVENTS = 'events',
  REGISTRATIONS = 'registrations',
  ADDRESSES = 'addresses'
}

export enum AccessConrtolActions {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CONTROL = 'CONTROL',
  PERMIT = 'PERMIT',
  GRANT = 'GRANT',
  PICK = 'PICK',
}

export enum AccessControlKinds {
  MENU = 'MENU',
  USER = 'USER',
  ROLE = 'ROLE',
  EVENT = 'EVENT',
  DEVICE = 'DEVICE',
  ADDRESS = 'ADDRESS'
}

export enum DeviceStatus {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  ERROR = 'ERROR',
}