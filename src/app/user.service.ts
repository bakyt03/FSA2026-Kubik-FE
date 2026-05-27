import { computed, inject, Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './core/auth-code-flow.config';
import { UserModel } from './core/model/user-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private oauthService = inject(OAuthService);
  private user = signal<UserModel | undefined>(undefined);
  private roles = signal<string[]>([]);
  // Stored so tryLogin() awaits the same Promise rather than firing a second
  // loadDiscoveryDocumentAndTryLogin() call that races with this one.
  private readonly loginReady: Promise<void>;

  readonly isAdmin = computed(() => this.roles().includes('ADMIN'));

  constructor() {
    this.oauthService.configure(authCodeFlowConfig);

    this.oauthService.events.subscribe((e) => {
      if (e.type === 'token_received' || e.type === 'token_refreshed') {
        this.user.set(this.oauthService.getIdentityClaims() as UserModel);
        this.syncRoles();
      } else if (e.type === 'logout') {
        this.user.set(undefined);
        this.roles.set([]);
      }
    });

    this.loginReady = this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.user.set(this.oauthService.getIdentityClaims() as UserModel);
        this.syncRoles();
      }
    });
  }

  getUser() {
    return this.user.asReadonly();
  }

  login() {
    this.oauthService.initCodeFlow();
  }

  logout() {
    this.oauthService.logOut();
  }

  async tryLogin() {
    await this.loginReady;
    return this.user();
  }

  private syncRoles() {
    const token = this.oauthService.getAccessToken();
    if (!token) {
      this.roles.set([]);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
      const realmAccess = payload['realm_access'] as { roles?: string[] } | undefined;
      this.roles.set(realmAccess?.roles ?? []);
    } catch {
      this.roles.set([]);
    }
  }
}
