import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchApi } from '../match-api';
import { PlayerApi } from '../../players/player-api';
import { MatchDetail, MatchSummary } from '../model/match.model';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../../user.service';
import { toSignal } from '@angular/core/rxjs-interop';

const PAGE_SIZE = 25;

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

  private currentPage = 0;
  protected loadedMatches = signal<MatchDetail[]>([]);
  protected hasMore = signal(true);
  protected loading = signal(false);
  protected initialLoading = signal(true);

  protected allPlayers = toSignal(this.playerApi.getAll());

  protected availableMaps = computed(() => {
    const matches = this.loadedMatches();
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
    const matches = this.loadedMatches();
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

  constructor() {
    this.loadMore();
  }

  protected loadMore(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.api.getAll(this.currentPage, PAGE_SIZE).subscribe({
      next: (summaries: MatchSummary[]) => {
        if (summaries.length < PAGE_SIZE) {
          this.hasMore.set(false);
        }
        if (!summaries.length) {
          this.loading.set(false);
          this.initialLoading.set(false);
          return;
        }
        forkJoin(summaries.map(s => this.api.getById(s.id))).subscribe({
          next: (details: MatchDetail[]) => {
            this.loadedMatches.update(existing => [...existing, ...details]);
            this.currentPage++;
            this.loading.set(false);
            this.initialLoading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.initialLoading.set(false);
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.initialLoading.set(false);
      },
    });
  }

  protected refresh(): void {
    this.loadedMatches.set([]);
    this.currentPage = 0;
    this.hasMore.set(true);
    this.initialLoading.set(true);
    this.loadMore();
  }

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

