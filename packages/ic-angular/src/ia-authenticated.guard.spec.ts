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
  const route = jasmine.createSpyObj<ActivatedRouteSnapshot>(
    'ActivatedRouteSnapshot',
    ['children'],
  );
  const state = jasmine.createSpyObj<RouterStateSnapshot>(
    'RouterStateSnapshot',
    ['url'],
  );

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

  [true, false].forEach(isAuthenticated => {
    it(`should return ${isAuthenticated} when authService returns isAuthenticated with value ${isAuthenticated}`, async () => {
      authServiceMock.isAuthenticated.and.resolveTo(isAuthenticated);

      const result = await executeGuard(route, state);

      expect(result).toBe(isAuthenticated);
    });
  });
});
