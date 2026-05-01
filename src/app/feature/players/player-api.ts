import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreatePlayerRequest, PlayerSummary } from './model/player.model';
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

  create(request: CreatePlayerRequest) {
    return this.http.post<void>(this.url, request);
  }
}
