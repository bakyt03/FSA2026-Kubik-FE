import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { PlayerApi } from '../../players/player-api';
import { TeamApi } from '../team-api';
import { PlayerSummary } from '../../players/model/player.model';
import { TeamSuggestionResponse } from '../model/team-suggestion.model';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-team-suggestions-page',
  imports: [SectionContainer, TranslatePipe, DecimalPipe],
  templateUrl: './team-suggestions-page.html',
})
export class TeamSuggestionsPage {
  private playerApi = inject(PlayerApi);
  private teamApi = inject(TeamApi);

  protected allPlayers = toSignal(this.playerApi.getAll());
  protected selectedPlayers = signal<PlayerSummary[]>([]);
  protected result = signal<TeamSuggestionResponse | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  protected availablePlayers = computed(() => {
    const selected = this.selectedPlayers();
    return (this.allPlayers() ?? []).filter(
      (p) => !selected.some((s) => s.id === p.id),
    );
  });

  protected canGenerate = computed(() => this.selectedPlayers().length === 10);

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
      .generateSuggestions(this.selectedPlayers().map((p) => p.id))
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
