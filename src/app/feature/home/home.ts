import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { SectionContainer } from '../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';
import { PlayerApi } from '../players/player-api';
import { PlayerMeDetail, PlayerMatchHistoryEntry } from '../players/model/player.model';
import { MatchApi } from '../matches/match-api';
import { MatchDetail, MatchSummary } from '../matches/model/match.model';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SectionContainer, TranslatePipe, DecimalPipe, DatePipe, UpperCasePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private playerApi = inject(PlayerApi);
  private matchApi = inject(MatchApi);
  private userService = inject(UserService);
  protected router = inject(Router);

  protected me = signal<PlayerMeDetail | null>(null);
  protected allMatches = signal<MatchSummary[]>([]);
  protected latestMatch = signal<MatchDetail | null>(null);
  protected loaded = signal(false);

  protected readonly totalMatches = computed(() => this.allMatches().length);
  protected readonly totalRounds = computed(() =>
    this.allMatches().reduce((sum, m) => sum + m.team1Score + m.team2Score, 0)
  );
  protected readonly avgRounds = computed(() =>
    this.totalMatches() > 0 ? this.totalRounds() / this.totalMatches() : 0
  );

  protected readonly mapFrequency = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.allMatches()) {
      counts.set(m.map, (counts.get(m.map) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([map, count]) => ({
        map,
        count,
        percent: this.totalMatches() > 0 ? Math.round((count / this.totalMatches()) * 100) : 0,
      }));
  });

  protected readonly isPersonalMatches = computed(() => {
    const me = this.me();
    return !!(me && me.recentMatches.length > 0);
  });

  protected readonly winRate = computed<number | null>(() => {
    const me = this.me();
    if (!me || me.recentMatches.length === 0) return null;
    const wins = me.recentMatches.filter(
      (m) =>
        (m.playerTeam === 'team1' && m.team1Score > m.team2Score) ||
        (m.playerTeam === 'team2' && m.team2Score > m.team1Score)
    ).length;
    return Math.round((wins / me.recentMatches.length) * 100);
  });

  async ngOnInit() {
    await this.userService.tryLogin();
    forkJoin({
      me: this.playerApi.getMe().pipe(catchError(() => of(null))),
      matches: this.matchApi.getAll(),
    }).pipe(
      switchMap(({ me, matches }) => {
        const latestId = me?.recentMatches[0]?.matchId ?? matches[0]?.id ?? null;
        return forkJoin({
          me: of(me),
          matches: of(matches),
          latestMatch: latestId
            ? this.matchApi.getById(latestId).pipe(catchError(() => of(null)))
            : of(null),
        });
      })
    ).subscribe(({ me, matches, latestMatch }) => {
      this.me.set(me);
      this.allMatches.set(matches);
      this.latestMatch.set(latestMatch);
      this.loaded.set(true);
    });
  }

  protected mapBackground(map: string): string {
    const name = map.charAt(0) + map.slice(1).toLowerCase();
    const ext = map === 'ANUBIS' ? 'webp' : 'jpg';
    return `url('/maps/${name}.${ext}')`;
  }

  protected mapLogo(map: string): string {
    const name = map.charAt(0) + map.slice(1).toLowerCase();
    const ext = map === 'ANUBIS' ? 'svg' : 'png';
    return `/maps/${name}Logo.${ext}`;
  }

  protected mapName(map: string): string {
    return map.charAt(0) + map.slice(1).toLowerCase();
  }

  protected isWin(match: PlayerMatchHistoryEntry): boolean {
    return (
      (match.playerTeam === 'team1' && match.team1Score > match.team2Score) ||
      (match.playerTeam === 'team2' && match.team2Score > match.team1Score)
    );
  }
}
