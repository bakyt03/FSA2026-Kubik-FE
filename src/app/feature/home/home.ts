import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { SectionContainer } from '../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';
import { PlayerApi } from '../players/player-api';
import { PlayerMeDetail } from '../players/model/player.model';
import { MatchApi } from '../matches/match-api';
import { MatchDetail } from '../matches/model/match.model';
import { catchError, of, switchMap } from 'rxjs';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SectionContainer, TranslatePipe, DecimalPipe, DatePipe, UpperCasePipe],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private playerApi = inject(PlayerApi);
  private matchApi = inject(MatchApi);
  private userService = inject(UserService);
  protected router = inject(Router);

  protected me = signal<PlayerMeDetail | null>(null);
  protected latestMatch = signal<MatchDetail | null>(null);
  protected loaded = signal(false);

  async ngOnInit() {
    await this.userService.tryLogin();
    this.playerApi.getMe().pipe(
      catchError(() => of(null))
    ).subscribe(result => {
      this.me.set(result);

      if (result && result.recentMatches.length > 0) {
        this.matchApi.getById(result.recentMatches[0].matchId).subscribe({
          next: (match) => { this.latestMatch.set(match); this.loaded.set(true); },
          error: () => this.loaded.set(true),
        });
      } else {
        this.matchApi.getAll().pipe(
          switchMap((matches) => matches.length > 0 ? this.matchApi.getById(matches[0].id) : of(null))
        ).subscribe({
          next: (match) => { this.latestMatch.set(match); this.loaded.set(true); },
          error: () => this.loaded.set(true),
        });
      }
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
}
