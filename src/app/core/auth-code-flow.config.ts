import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const authCodeFlowConfig: AuthConfig = {
  issuer: environment.keyCloakUrl + '/realms/FSA',
  redirectUri: environment.appUrl + '/home',
  silentRefreshRedirectUri: environment.appUrl + '/home',
  clientId: 'fsa-client',
  responseType: 'code',
  scope: 'openid profile email roles offline_access',
  useSilentRefresh: true,
  timeoutFactor: 0.75,
  silentRefreshTimeout: 5000,
  sessionChecksEnabled: true,
  showDebugInformation: true,
  requireHttps: false,
};
