/**
 * permissions.js — Shared permission helper for AruvixLabs CRM
 *
 * Usage in any component:
 *   import { getPerms } from './permissions';
 *   const { canView, canCreate, canEdit, canDelete } = getPerms('leads');
 */

export function getPerms(module) {
  let permissions = {};
  try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch(e){}
  const role = (localStorage.getItem('role') || 'employee').toLowerCase();
  const isAdmin = role === 'admin';
  const mod = permissions[module];

  let canView = true;
  let canCreate = true;
  let canEdit = true;
  let canDelete = true;

  if (isAdmin) {
    canView = true;
    canCreate = true;
    canEdit = true;
    canDelete = true;
  } else if (mod === undefined) {
    // Default fallback: allow all operational pages except settings & user_management for non-admins
    const isRestrictedByDefault = module === 'settings' || module === 'user_management';
    canView = !isRestrictedByDefault;
    canCreate = !isRestrictedByDefault;
    canEdit = !isRestrictedByDefault;
    canDelete = !isRestrictedByDefault;
  } else if (typeof mod === 'boolean') {
    canView = mod;
    canCreate = mod;
    canEdit = mod;
    canDelete = mod;
  } else if (typeof mod === 'object' && mod !== null) {
    canView = mod.view !== undefined ? !!mod.view : (mod.canView !== undefined ? !!mod.canView : true);
    canCreate = mod.create !== undefined ? !!mod.create : (mod.canCreate !== undefined ? !!mod.canCreate : true);
    canEdit = mod.edit !== undefined ? !!mod.edit : (mod.canEdit !== undefined ? !!mod.canEdit : true);
    canDelete = mod.delete !== undefined ? !!mod.delete : (mod.canDelete !== undefined ? !!mod.canDelete : true);
  }

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    role
  };
}
