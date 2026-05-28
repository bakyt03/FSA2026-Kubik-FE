import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerApi } from '../../players/player-api';
import { TeamApi } from '../team-api';
import { PlayerSummary } from '../../players/model/player.model';
import { TeamSuggestionResponse } from '../model/team-suggestion.model';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-team-suggestions-page',
  imports: [SectionContainer, TranslatePipe, DecimalPipe, FormsModule],
  templateUrl: './team-suggestions-page.html',
  styleUrl: './team-suggestions-page.scss',
})
export class TeamSuggestionsPage {
  private playerApi = inject(PlayerApi);
  private teamApi = inject(TeamApi);

  protected allPlayers = toSignal(this.playerApi.getAll());
  protected selectedPlayers = signal<PlayerSummary[]>([]);
  protected result = signal<TeamSuggestionResponse | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected searchNickname = signal('');
  protected maxAdrDifference = signal(5);

  protected availablePlayers = computed(() => {
    const selected = this.selectedPlayers();
    return (this.allPlayers() ?? []).filter(
      (p) => !selected.some((s) => s.id === p.id),
    );
  });

  protected filteredAvailable = computed(() => {
    const search = this.searchNickname().toLowerCase().trim();
    return this.availablePlayers().filter(
      (p) => !search || p.nickname.toLowerCase().includes(search),
    );
  });

  protected allPlayersMap = computed(() => {
    const map = new Map<number, PlayerSummary>();
    for (const p of this.allPlayers() ?? []) map.set(p.id, p);
    return map;
  });

  protected canGenerate = computed(() => this.selectedPlayers().length === 10);

  protected teamTotalAdr(players: PlayerSummary[]): number {
    return players.reduce((sum, p) => sum + (p.avgAdr ?? 0), 0);
  }

  protected sortByAdr(players: PlayerSummary[]): PlayerSummary[] {
    return [...players].sort((a, b) => (b.avgAdr ?? 0) - (a.avgAdr ?? 0));
  }

  protected selectPlayer(player: PlayerSummary) {
    if (this.selectedPlayers().length >= 10) return;
    this.selectedPlayers.update((list) => [...list, player]);
  }

  protected deselectPlayer(player: PlayerSummary) {
    this.selectedPlayers.update((list) => list.filter((p) => p.id !== player.id));
    this.result.set(null);
    this.error.set(null);
  }

  protected onGenerate() {
    if (!this.canGenerate()) return;

    this.loading.set(true);
    this.result.set(null);
    this.error.set(null);

    this.teamApi
      .generateSuggestions(this.selectedPlayers().map((p) => p.id), this.maxAdrDifference())
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.result.set(res);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('error.generic');
        },
      });
  }
}
