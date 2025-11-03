// Fix: Create a permissions configuration file.
import { Role } from '../types';

export const PERMISSIONS = {
  // SUBSCRIBERS
  'subscribers:read': [Role.Admin, Role.Support],
  'subscribers:create': [Role.Admin, Role.Support],
  'subscribers:update': [Role.Admin, Role.Support],
  'subscribers:delete': [Role.Admin],
  'subscribers:import': [Role.Admin],
  'subscribers:export': [Role.Admin, Role.Support],
  'subscribers:sendMessage': [Role.Admin, Role.Support],

  // STAFF
  'staff:read': [Role.Admin],
  'staff:create': [Role.Admin],
  'staff:update': [Role.Admin],
  'staff:delete': [Role.Admin],

  // SETTINGS
  'settings:read': [Role.Admin],
  'settings:update': [Role.Admin],

  // DASHBOARD / METRICS
  'dashboard:view': [Role.Admin, Role.Support],
  'metrics:view': [Role.Admin],
};

export type Permission = keyof typeof PERMISSIONS;

export const hasPermission = (userRole: Role, permission: Permission): boolean => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
};
