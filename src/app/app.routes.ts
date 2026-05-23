import { Routes } from '@angular/router';
import { isLoggedIn } from './core/app-guards';
import { PageNotFound } from './core/component/page-not-found/page-not-found';
import { Home } from './feature/home/home';
import { MatchesPage } from './feature/matches/matches-page/matches-page';
import { AddMatchPage } from './feature/matches/add-match-page/add-match-page';
import { MatchDetailPage } from './feature/matches/match-detail-page/match-detail-page';
import { PlayersPage } from './feature/players/players-page/players-page';
import { PlayerDetailPage } from './feature/players/player-detail-page/player-detail-page';
import { TeamSuggestionsPage } from './feature/team-suggestions/team-suggestions-page/team-suggestions-page';

export const routes: Routes = [
  { path: 'home', component: Home, canActivate: [isLoggedIn] },
  { path: 'players/:id', component: PlayerDetailPage, canActivate: [isLoggedIn] },
  { path: 'players', component: PlayersPage, canActivate: [isLoggedIn] },
  { path: 'matches/add', component: AddMatchPage, canActivate: [isLoggedIn] },
  { path: 'matches/:id', component: MatchDetailPage, canActivate: [isLoggedIn] },
  { path: 'matches', component: MatchesPage, canActivate: [isLoggedIn] },
  { path: 'team-suggestions', component: TeamSuggestionsPage, canActivate: [isLoggedIn] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFound },
];
