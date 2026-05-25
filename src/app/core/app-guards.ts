import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../user.service';

export const isLoggedIn: CanActivateFn = () => {
  const userService = inject(UserService);
  return userService.tryLogin().then((user) => {
    if (user) return true;
    userService.login();
    return false;
  });
};

export const isAdmin: CanActivateFn = async () => {
  const userService = inject(UserService);
  const router = inject(Router);

  await userService.tryLogin();
  if (userService.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/home']);
};
