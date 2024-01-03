import { Identity } from '@dfinity/agent';
import { AuthClient, IdleManager } from '@dfinity/auth-client';
import { IcAuthService } from './auth.service';

export type IdleManagerMock = jasmine.SpyObj<IdleManager>;

export function createIdleManagerMock(): IdleManagerMock {
  return jasmine.createSpyObj<IdleManager>('IdleManager', ['registerCallback']);
}

export type AuthClientMock = jasmine.SpyObj<AuthClient>;

export function createAuthClientMock(): AuthClientMock {
  return jasmine.createSpyObj<AuthClient>('AuthClient', [
    'isAuthenticated',
    'getIdentity',
    'login',
    'logout',
  ]);
}

export type IdentityMock = jasmine.SpyObj<Identity>;

export function createIdentityMock(): IdentityMock {
  return jasmine.createSpyObj<Identity>('Identity', [
    'getPrincipal',
    'transformRequest',
  ]);
}

export type AuthServiceMock = jasmine.SpyObj<IcAuthService>;

export function createAuthServiceMock(): AuthServiceMock {
  return jasmine.createSpyObj<IcAuthService>('IcAuthService', [
    'isAuthenticated',
    'getIdentity',
    'setAuthClient',
    'login',
    'logout',
  ]);
}
