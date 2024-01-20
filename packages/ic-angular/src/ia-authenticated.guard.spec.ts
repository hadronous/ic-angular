import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { isAuthenticatedGuard } from './is-authenticated.guard';
import { IcAuthService } from './auth.service';
import { createAuthServiceMock } from './auth.service.mock';

describe('isAuthenticatedGuard', () => {
  let authServiceMock = createAuthServiceMock();

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      isAuthenticatedGuard(...guardParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: IcAuthService, useValue: authServiceMock }],
    });
  });

  it('should allow access when user is authenticated', async () => {
    const route = jasmine.createSpyObj<ActivatedRouteSnapshot>(
      'ActivatedRouteSnapshot',
      ['children'],
    );
    const state = jasmine.createSpyObj<RouterStateSnapshot>(
      'RouterStateSnapshot',
      ['url'],
    );

    authServiceMock.isAuthenticated.and.resolveTo(true);

    const result = await executeGuard(route, state);

    expect(result).toBe(true);
  });

  it('should not allow access when user is not authenticated', async () => {
    const route = jasmine.createSpyObj<ActivatedRouteSnapshot>(
      'ActivatedRouteSnapshot',
      ['children'],
    );
    const state = jasmine.createSpyObj<RouterStateSnapshot>(
      'RouterStateSnapshot',
      ['url'],
    );

    authServiceMock.isAuthenticated.and.resolveTo(false);

    const result = await executeGuard(route, state);

    expect(result).toBe(false);
  });
});
