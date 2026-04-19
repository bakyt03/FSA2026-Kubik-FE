import { inject, Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './core/auth-code-flow.config';
import { UserModel } from './core/model/user-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private oauthService = inject(OAuthService);
  private user = signal<UserModel | undefined>(undefined);

  constructor() {
    this.oauthService.configure(authCodeFlowConfig);
    this.tryLogin();
  }

  getUser() {
    return this.user.asReadonly();
  }

  login() {
    this.oauthService.loadDiscoveryDocumentAndLogin().then(() => {
      this.user.set(this.oauthService.getIdentityClaims() as UserModel);
    });
  }

  logout() {
    this.oauthService.logOut();
    this.user.set(undefined);
  }

  async tryLogin() {
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.user.set(this.oauthService.getIdentityClaims() as UserModel);
    return this.user();
  }
}
