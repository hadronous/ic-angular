import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { IcAuthService } from './auth.service';

/**
 * Route guard allowing navigation only when the current user is authenticated. Depends on {@link IcAuthService}.
 *
 * @see {@link IcAuthService}
 *
 * @example
 * ```ts
 * import { type Routes } from '@angular/router';
 * import { isAuthenticatedGuard } from '@hadronous/ic-angular';
 *
 * export const routes: Routes = [
 *   {
 *     path: 'profile/edit',
 *     loadComponent: () => import('./pages/profile-edit').then(m => m.ProfileEditComponent),
 *     canActivate: [isAuthenticatedGuard],
 *   },
 * ];
 * ```
 */
export const isAuthenticatedGuard: CanActivateFn = () => {
  return inject(IcAuthService).isAuthenticated();
};
