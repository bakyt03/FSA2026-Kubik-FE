import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateMatchRequest, MatchDetail, MatchSummary } from './model/match.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MatchApi {
  private http = inject(HttpClient);
  private readonly url = environment.beUrl + '/matches';

  getAll(page: number = 0, size: number = 25) {
    return this.http.get<MatchSummary[]>(`${this.url}?page=${page}&size=${size}`);
  }

  getById(id: number) {
    return this.http.get<MatchDetail>(`${this.url}/${id}`);
  }

  create(request: CreateMatchRequest) {
    return this.http.post<void>(this.url, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
