import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import {
  AUTH_CRED,
  EMAIL_VERIFIED,
  PERMISSIONS,
  STAFF,
  STORE_OWNER,
  SUPER_ADMIN,
  TOKEN,
} from './constants';
import { UserAuthType } from '@/types/auth';

export const allowedRoles = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminAndOwnerOnly = [SUPER_ADMIN, STORE_OWNER];
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [STORE_OWNER];
export const ownerAndStaffOnly = [STORE_OWNER, STAFF];

export function setAuthCredentials(token: string, permissions: any, role: any) {
  Cookie.set(AUTH_CRED, JSON.stringify({ token, permissions, role }));
}
export function setEmailVerified(emailVerified: boolean) {
  Cookie.set(EMAIL_VERIFIED, JSON.stringify({ emailVerified }));
}
export function getEmailVerified(): {
  emailVerified: boolean;
} {
  const emailVerified = Cookie.get(EMAIL_VERIFIED);
  return emailVerified ? JSON.parse(emailVerified) : false;
}

export function getAuthCredentials(context?: any): {
  token: string | null;
  permissions: string[] | null;
  role: string | null;
} {
  let authCred;
  if (context) {
    authCred = parseSSRCookie(context)[AUTH_CRED];
  } else {
    authCred = Cookie.get(AUTH_CRED);
  }
  if (authCred) {
    return JSON.parse(authCred);
  }
  return { token: null, permissions: null, role: null };
}

export function parseSSRCookie(context: any) {
  return SSRCookie.parse(context.req.headers.cookie ?? '');
}

export function hasAccess(
  _allowedRoles: string[],
  _userPermissions: string[] | undefined | null,
) {
  if (_userPermissions) {
    return Boolean(
      _allowedRoles?.find((aRole) => _userPermissions.includes(aRole)),
    );
  }
  return false;
}
export function isAuthenticated(_cookies: any) {
  return (
    !!_cookies[TOKEN] &&
    Array.isArray(_cookies[PERMISSIONS]) &&
    !!_cookies[PERMISSIONS].length
  );
}

// RAMP AUTH
const USER_AUTH_DATA = 'ramp_user';

export function setUserAuthData(data: UserAuthType) {
  Cookie.set(USER_AUTH_DATA, JSON.stringify(data));
}

export function getUserAuthData(context?: any) {
  let authCred;
  if (context) {
    authCred = parseSSRCookie(context)[USER_AUTH_DATA];
  } else {
    authCred = Cookie.get(USER_AUTH_DATA);
  }

  if (!authCred) {
    return null;
  } else {
    if (authCred) {
      return JSON.parse(authCred) as UserAuthType;
    }
  }
}

export function isUserAuthenticated() {
  const user = getUserAuthData();

  if (!user) return false;
  return user.token && user.permissions;
}

export function isStoreOwner() {
  const user = getUserAuthData();

  if (!user) {
    clearStorage();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  return user?.role === 'store_owner';
}

export const clearStorage = () => {
  if (typeof window !== 'undefined') {
    Cookie.remove(USER_AUTH_DATA);
    localStorage.clear();
    sessionStorage.clear();
  }
};
