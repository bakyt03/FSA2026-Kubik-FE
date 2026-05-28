import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreatePlayerRequest, PlayerDetail, PlayerMatchHistoryEntry, PlayerMeDetail, PlayerSummary } from './model/player.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlayerApi {
  private http = inject(HttpClient);
  private readonly url = environment.beUrl + '/players';

  getAll() {
    return this.http.get<PlayerSummary[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<PlayerDetail>(`${this.url}/${id}`);
  }

  create(request: CreatePlayerRequest) {
    return this.http.post<void>(this.url, request);
  }

  getMe() {
    return this.http.get<PlayerMeDetail>(`${this.url}/me`);
  }

  linkUser(id: number, keycloakId: string) {
    return this.http.patch<void>(`${this.url}/${id}/link-user`, { keycloakId });
  }

  unlinkUser(id: number) {
    return this.http.delete<void>(`${this.url}/${id}/link-user`);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getMatchHistory(id: number, page: number = 0, size: number = 10) {
    return this.http.get<PlayerMatchHistoryEntry[]>(`${this.url}/${id}/matches?page=${page}&size=${size}`);
  }
}
