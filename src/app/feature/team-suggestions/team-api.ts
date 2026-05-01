import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TeamSuggestionResponse } from './model/team-suggestion.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamApi {
  private http = inject(HttpClient);
  private readonly url = environment.beUrl + '/team-suggestions';

  generateSuggestions(playerIds: number[]) {
    return this.http.post<TeamSuggestionResponse>(this.url, { playerIds });
  }
}
