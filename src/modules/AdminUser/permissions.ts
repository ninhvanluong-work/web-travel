import type { IAdminUser, UserRole } from '@/api/user/types';

/**
 * Mirrors the backend rules (Swagger, CreateUserDto.role):
 * - admin may assign normal / tour_guide
 * - super_admin may additionally assign admin
 * - nobody can assign super_admin
 * The backend stays the source of truth; these only hide actions that would be rejected.
 */
export interface Actor {
  id: string | undefined;
  role: string | undefined;
}

const isAdminRole = (role: string | undefined) => role === 'admin' || role === 'super_admin';

export function getAssignableRoles(actorRole: string | undefined): UserRole[] {
  if (actorRole === 'super_admin') return ['normal', 'tour_guide', 'admin'];
  if (actorRole === 'admin') return ['normal', 'tour_guide'];
  return [];
}

export function isSelf(actor: Actor, target: Pick<IAdminUser, 'id'>): boolean {
  return !!actor.id && actor.id === target.id;
}

/** Whether the actor may edit the target's profile (name/email) and reset its password. */
export function canManageUser(actor: Actor, target: Pick<IAdminUser, 'id' | 'role'>): boolean {
  if (!isAdminRole(actor.role)) return false;
  if (isSelf(actor, target)) return true;
  if (target.role === 'super_admin') return false;
  if (target.role === 'admin') return actor.role === 'super_admin';
  return true;
}

/** Role changes: never on yourself (avoid locking yourself out), never to/from super_admin. */
export function canChangeRole(actor: Actor, target: Pick<IAdminUser, 'id' | 'role'>): boolean {
  return canManageUser(actor, target) && !isSelf(actor, target) && target.role !== 'super_admin';
}

/** Deleting yourself or a super_admin is never allowed. */
export function canDeleteUser(actor: Actor, target: Pick<IAdminUser, 'id' | 'role'>): boolean {
  return canManageUser(actor, target) && !isSelf(actor, target);
}
