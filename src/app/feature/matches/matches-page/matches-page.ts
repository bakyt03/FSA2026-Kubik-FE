import { Component, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, forkJoin, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchApi } from '../match-api';
import { PlayerApi } from '../../players/player-api';
import { MatchDetail } from '../model/match.model';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-matches-page',
  imports: [SectionContainer, TranslatePipe, FormsModule],
  templateUrl: './matches-page.html',
  styleUrl: './matches-page.scss',
})
export class MatchesPage {
  private api = inject(MatchApi);
  private playerApi = inject(PlayerApi);
  private router = inject(Router);
  private userService = inject(UserService);

  protected readonly isLoggedIn = this.userService.getUser();

  private refresh$ = new BehaviorSubject<void>(undefined);

  protected matchDetails = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.api.getAll()),
      switchMap(summaries => {
        if (!summaries?.length) return of([] as MatchDetail[]);
        return forkJoin(summaries.map(s => this.api.getById(s.id)));
      }),
    ),
  );

  protected allPlayers = toSignal(this.playerApi.getAll());

  protected availableMaps = computed(() => {
    const matches = this.matchDetails();
    if (!matches?.length) return [];
    return [...new Set(matches.map(m => m.map))].sort();
  });

  protected filterMap = signal('');
  protected filterPlayer = signal<number | null>(null);
  protected filterDateFrom = signal('');
  protected filterDateTo = signal('');

  protected hasFilters = computed(
    () => !!this.filterMap() || !!this.filterPlayer() || !!this.filterDateFrom() || !!this.filterDateTo(),
  );

  protected filteredMatches = computed(() => {
    const matches = this.matchDetails();
    if (!matches) return undefined;
    const map = this.filterMap();
    const playerId = this.filterPlayer();
    const from = this.filterDateFrom();
    const to = this.filterDateTo();
    return matches.filter(m => {
      if (map && m.map !== map) return false;
      if (playerId) {
        const inTeam1 = m.team1Players.some(p => p.playerId === playerId);
        const inTeam2 = m.team2Players.some(p => p.playerId === playerId);
        if (!inTeam1 && !inTeam2) return false;
      }
      if (from && m.playedAt < from) return false;
      if (to && m.playedAt > to) return false;
      return true;
    });
  });

  protected clearFilters() {
    this.filterMap.set('');
    this.filterPlayer.set(null);
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
  }

  protected onAddMatchClick() {
    this.router.navigate(['/matches/add']);
  }

  protected onMatchClick(id: number) {
    this.router.navigate(['/matches', id]);
  }

  protected getMapBackground(map: string): string {
    const name = this.mapName(map);
    const ext = map === 'ANUBIS' ? 'webp' : 'jpg';
    return `url('/maps/${name}.${ext}')`;
  }

  protected getMapLogo(map: string): string {
    const name = this.mapName(map);
    const ext = map === 'ANUBIS' ? 'svg' : 'png';
    return `/maps/${name}Logo.${ext}`;
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private mapName(map: string): string {
    return map.charAt(0) + map.slice(1).toLowerCase();
  }
}
