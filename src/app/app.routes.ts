import { Routes } from '@angular/router';
import { isAdmin, isLoggedIn } from './core/app-guards';
import { PageNotFound } from './core/component/page-not-found/page-not-found';
import { Home } from './feature/home/home';
import { MatchesPage } from './feature/matches/matches-page/matches-page';
import { AddMatchPage } from './feature/matches/add-match-page/add-match-page';
import { MatchDetailPage } from './feature/matches/match-detail-page/match-detail-page';
import { PlayersPage } from './feature/players/players-page/players-page';
import { PlayerDetailPage } from './feature/players/player-detail-page/player-detail-page';
import { TeamSuggestionsPage } from './feature/team-suggestions/team-suggestions-page/team-suggestions-page';
import { UsersPage } from './feature/users/users-page/users-page';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'players/:id', component: PlayerDetailPage },
  { path: 'players', component: PlayersPage },
  { path: 'matches/add', component: AddMatchPage, canActivate: [isLoggedIn] },
  { path: 'matches/:id', component: MatchDetailPage },
  { path: 'matches', component: MatchesPage },
  { path: 'team-suggestions', component: TeamSuggestionsPage },
  { path: 'users', component: UsersPage, canActivate: [isAdmin] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFound },
];
