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

  if (module === 'settings' || module === 'user_management') {
    if (!isAdmin) {
      return { canView: false, canCreate: false, canEdit: false, canDelete: false, isAdmin: false, role };
    }
  }

  if (isAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true, isAdmin: true, role };
  }

  let canView = true;
  let canCreate = true;
  let canEdit = true;
  let canDelete = true;

  if (mod === undefined || mod === null) {
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
    canView   = mod.view !== undefined ? !!mod.view : (mod.canView !== undefined ? !!mod.canView : false);
    canCreate = mod.create !== undefined ? !!mod.create : (mod.canCreate !== undefined ? !!mod.canCreate : false);
    canEdit   = mod.edit !== undefined ? !!mod.edit : (mod.canEdit !== undefined ? !!mod.canEdit : false);
    canDelete = mod.delete !== undefined ? !!mod.delete : (mod.canDelete !== undefined ? !!mod.canDelete : false);
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
