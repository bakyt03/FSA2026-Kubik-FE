import { Component, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { PlayerApi } from '../player-api';
import { PlayerSummary } from '../model/player.model';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { CreatePlayerModal } from '../create-player-modal/create-player-modal';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../../user.service';

type SortCol = 'nickname' | 'avgKills' | 'avgKillsPerRound' | 'avgDeaths' | 'avgKdRatio' | 'avgAdr' | 'winRate' | 'matchesPlayed';

@Component({
  selector: 'app-players-page',
  imports: [SectionContainer, TranslatePipe, DecimalPipe],
  templateUrl: './players-page.html',
})
export class PlayersPage {
  private api = inject(PlayerApi);
  private modal = inject(NgbModal);
  private router = inject(Router);
  private userService = inject(UserService);

  protected readonly isLoggedIn = this.userService.getUser();

  private refresh$ = new BehaviorSubject<void>(undefined);

  protected players = toSignal(
    this.refresh$.pipe(switchMap(() => this.api.getAll())),
  );

  protected sortCol = signal<SortCol>('avgAdr');
  protected sortDir = signal<1 | -1>(-1);

  protected sortedPlayers = computed(() => {
    const players = this.players();
    if (!players) return undefined;
    const col = this.sortCol();
    const dir = this.sortDir();
    return [...players].sort((a, b) => {
      if (col === 'nickname') {
        const av = (a.nickname ?? '').toLowerCase();
        const bv = (b.nickname ?? '').toLowerCase();
        return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
      }
      const av = (a[col as keyof PlayerSummary] as number | undefined) ?? -Infinity;
      const bv = (b[col as keyof PlayerSummary] as number | undefined) ?? -Infinity;
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  });

  protected sort(col: SortCol) {
    if (this.sortCol() === col) {
      this.sortDir.update(d => (d === -1 ? 1 : -1));
    } else {
      this.sortCol.set(col);
      this.sortDir.set(col === 'nickname' ? 1 : -1);
    }
  }

  protected sortIcon(col: SortCol): string {
    if (this.sortCol() !== col) return '⇵';
    return this.sortDir() === -1 ? '↓' : '↑';
  }

  protected onAddPlayerClick() {
    this.modal.open(CreatePlayerModal).result.then(
      () => this.refresh$.next(),
      () => {},
    );
  }

  protected onPlayerClick(id: number) {
    this.router.navigate(['/players', id]);
  }
}
