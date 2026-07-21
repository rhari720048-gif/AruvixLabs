/**
 * permissions.js — Shared permission helper for AruvixLabs CRM
 *
 * Rules:
 * 1. Admin role gets all pages & full CRUD permissions by default.
 * 2. ALL NON-ADMIN USERS (CTO, Manager, Employee, Telecaller, Sales, or any custom role):
 *    - On all regular CRM pages (Leads, Clients, Appointments, Call Later, NI Box, Call History, Completed Work, Dashboard, Profile),
 *      non-admin users HAVE FULL ACCESS (canView = true, canCreate = true, canEdit = true, canDelete = true).
 *    - Settings & Staff Management (user_management) are hidden by default and ONLY accessible if Admin explicitly grants permission.
 */

export function getPerms(module) {
  let permissions = {};
  try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch(e){}
  const rawRole = (localStorage.getItem('role') || 'employee').trim().toLowerCase();
  const isAdmin = rawRole === 'admin';
  const mod = permissions[module];

  // Admin gets all pages and permissions by default
  if (isAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true, isAdmin: true, role: rawRole };
  }

  const isRestricted = module === 'settings' || module === 'user_management';

  if (!isRestricted) {
    // Regular CRM pages ALWAYS grant FULL ACCESS (View, Create, Edit, Delete) for all non-admin roles!
    return { 
      canView: true, 
      canCreate: true, 
      canEdit: true, 
      canDelete: true, 
      isAdmin: false, 
      role: rawRole 
    };
  }

  // Restricted pages (settings & user_management): ONLY accessible if explicitly granted
  let canView = false;
  let canCreate = false;
  let canEdit = false;
  let canDelete = false;

  if (typeof mod === 'boolean') {
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
    isAdmin: false,
    role: rawRole
  };
}
