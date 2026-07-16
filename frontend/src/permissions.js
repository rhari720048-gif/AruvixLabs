/**
 * permissions.js — Shared permission helper for AruvixLabs CRM
 *
 * Usage in any component:
 *   import { getPerms } from './permissions';
 *   const { canCreate, canEdit, canDelete } = getPerms('projects');
 */

export function getPerms(module) {
  let permissions = {};
  try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch(e){}
  const role = (localStorage.getItem('role') || 'employee').toLowerCase();
  const isAdmin = role === 'admin';
  const mod = permissions[module] || {};

  return {
    canView:   isAdmin || !!mod.view,
    canCreate: isAdmin || !!mod.create,
    canEdit:   isAdmin || !!mod.edit,
    canDelete: isAdmin || !!mod.delete,
    isAdmin,
    role,
  };
}
