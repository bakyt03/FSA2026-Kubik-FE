import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { PlayerApi } from '../player-api';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';
import { PlayerMatchHistoryEntry } from '../model/player.model';

@Component({
  selector: 'app-player-detail-page',
  imports: [DecimalPipe, SectionContainer, TranslatePipe],
  templateUrl: './player-detail-page.html',
  styleUrl: './player-detail-page.scss',
})
export class PlayerDetailPage {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private playerApi = inject(PlayerApi);

  protected player = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.playerApi.getById(Number(params.get('id')))),
    ),
  );

  protected getMapBackground(map: string): string {
    const name = map.charAt(0) + map.slice(1).toLowerCase();
    const ext = map === 'ANUBIS' ? 'webp' : 'jpg';
    return `url('/maps/${name}.${ext}')`;
  }

  protected getMapLogo(map: string): string {
    const name = map.charAt(0) + map.slice(1).toLowerCase();
    const ext = map === 'ANUBIS' ? 'svg' : 'png';
    return `/maps/${name}Logo.${ext}`;
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  protected getScore(entry: PlayerMatchHistoryEntry): string {
    return `${entry.team1Score} : ${entry.team2Score}`;
  }

  protected goBack() {
    this.router.navigate(['/players']);
  }
}
