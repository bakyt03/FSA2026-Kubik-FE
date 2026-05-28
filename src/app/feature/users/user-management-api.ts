import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KeycloakUserDto } from '../players/model/player.model';

@Injectable({ providedIn: 'root' })
export class UserManagementApi {
  private http = inject(HttpClient);

  createUser(email: string, password: string, firstName: string, lastName: string): Observable<void> {
    return this.http.post<void>(environment.beUrl + '/users', { email, password, firstName, lastName });
  }

  getKeycloakUsers(): Observable<KeycloakUserDto[]> {
    return this.http.get<KeycloakUserDto[]>(environment.beUrl + '/users');
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.beUrl}/users/${id}`);
  }
}
