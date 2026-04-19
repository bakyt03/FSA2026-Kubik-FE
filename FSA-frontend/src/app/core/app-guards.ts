import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../user.service';

export const isLoggedIn: CanActivateFn = () => {
  const userService = inject(UserService);

  return userService.tryLogin().then((user) => {
    if (user) {
      return true;
    } else {
      userService.login();
      return false;
    }
  });
};
