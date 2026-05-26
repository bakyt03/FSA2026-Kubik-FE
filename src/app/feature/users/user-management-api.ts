import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KeycloakUserDto } from '../players/model/player.model';

@Injectable({ providedIn: 'root' })
export class UserManagementApi {
  private http = inject(HttpClient);

  createUser(email: string, password: string): Observable<void> {
    return this.http.post<void>(environment.beUrl + '/users', { email, password });
  }

  getKeycloakUsers(): Observable<KeycloakUserDto[]> {
    return this.http.get<KeycloakUserDto[]>(environment.beUrl + '/users');
  }
}
