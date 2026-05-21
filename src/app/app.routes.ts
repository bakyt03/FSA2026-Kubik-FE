import { Routes } from '@angular/router';
import { isLoggedIn } from './core/app-guards';
import { PageNotFound } from './core/component/page-not-found/page-not-found';
import { Home } from './feature/home/home';
import { MatchesPage } from './feature/matches/matches-page/matches-page';
import { AddMatchPage } from './feature/matches/add-match-page/add-match-page';
import { PlayersPage } from './feature/players/players-page/players-page';
import { TeamSuggestionsPage } from './feature/team-suggestions/team-suggestions-page/team-suggestions-page';

export const routes: Routes = [
  { path: 'home', component: Home, canActivate: [isLoggedIn] },
  { path: 'players', component: PlayersPage, canActivate: [isLoggedIn] },
  { path: 'matches/add', component: AddMatchPage, canActivate: [isLoggedIn] },
  { path: 'matches', component: MatchesPage, canActivate: [isLoggedIn] },
  { path: 'team-suggestions', component: TeamSuggestionsPage, canActivate: [isLoggedIn] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFound },
];
