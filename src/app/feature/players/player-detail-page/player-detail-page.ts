import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerApi } from '../player-api';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';
import { KeycloakUserDto, PlayerMatchHistoryEntry, PlayerSummary } from '../model/player.model';
import { UserService } from '../../../user.service';
import { UserManagementApi } from '../../users/user-management-api';

const MATCH_PAGE_SIZE = 10;

@Component({
  selector: 'app-player-detail-page',
  imports: [DecimalPipe, FormsModule, SectionContainer, TranslatePipe],
  templateUrl: './player-detail-page.html',
  styleUrl: './player-detail-page.scss',
})
export class PlayerDetailPage {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private playerApi = inject(PlayerApi);
  protected userService = inject(UserService);
  private userManagementApi = inject(UserManagementApi);

  protected player = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.playerApi.getById(Number(params.get('id')))),
    ),
  );

  protected keycloakUsers = signal<KeycloakUserDto[]>([]);
  protected allPlayers = signal<PlayerSummary[]>([]);
  protected selectedKeycloakId = signal<string>('');
  protected linkMessage = signal<string | null>(null);
  protected linkError = signal<string | null>(null);

  // Match history pagination
  private matchHistoryPage = 0;
  protected matchHistory = signal<PlayerMatchHistoryEntry[]>([]);
  protected hasMoreMatches = signal(true);
  protected loadingMatches = signal(false);

  /** Keycloak users not yet linked to any OTHER player */
  protected filteredKeycloakUsers = computed(() => {
    const takenIds = new Set(
      this.allPlayers()
        .map((p) => p.keycloakId)
        .filter((id): id is string => !!id && id !== this.player()?.keycloakId),
    );
    return this.keycloakUsers().filter((u) => !takenIds.has(u.id));
  });

  /** Username of the currently linked account, if any */
  protected linkedUsername = computed(() => {
    const kid = this.player()?.keycloakId;
    if (!kid) return null;
    return this.keycloakUsers().find((u) => u.id === kid)?.username ?? kid;
  });

  constructor() {
    effect(() => {
      if (this.userService.isAdmin()) {
        this.userManagementApi.getKeycloakUsers().subscribe({
          next: (users) => this.keycloakUsers.set(users),
        });
        this.playerApi.getAll().subscribe({
          next: (players) => this.allPlayers.set(players),
        });
      }
    });

    // Load first page of match history when player ID changes
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.matchHistoryPage = 0;
        this.matchHistory.set([]);
        this.hasMoreMatches.set(true);
        this.loadMoreMatches(id);
      }
    });
  }

  protected loadMoreMatches(playerId?: number): void {
    const id = playerId ?? this.player()?.id;
    if (!id || this.loadingMatches()) return;
    this.loadingMatches.set(true);
    this.playerApi.getMatchHistory(id, this.matchHistoryPage, MATCH_PAGE_SIZE).subscribe({
      next: (entries) => {
        if (entries.length < MATCH_PAGE_SIZE) {
          this.hasMoreMatches.set(false);
        }
        this.matchHistory.update(existing => [...existing, ...entries]);
        this.matchHistoryPage++;
        this.loadingMatches.set(false);
      },
      error: () => this.loadingMatches.set(false),
    });
  }

  protected linkUser() {
    const player = this.player();
    if (!player || !this.selectedKeycloakId()) return;
    this.linkMessage.set(null);
    this.linkError.set(null);
    this.playerApi.linkUser(player.id, this.selectedKeycloakId()).subscribe({
      next: () => {
        this.linkMessage.set('players.linkSuccess');
        // Refresh players list so the newly linked ID is excluded from other dropdowns
        this.playerApi.getAll().subscribe((players) => this.allPlayers.set(players));
      },
      error: (err) => this.linkError.set(err.status === 409 ? 'players.linkConflict' : 'error.generic'),
    });
  }

  protected unlinkUser() {
    const player = this.player();
    if (!player) return;
    this.linkMessage.set(null);
    this.linkError.set(null);
    this.playerApi.unlinkUser(player.id).subscribe({
      next: () => {
        this.linkMessage.set('players.unlinkSuccess');
        this.playerApi.getAll().subscribe((players) => this.allPlayers.set(players));
      },
      error: () => this.linkError.set('error.generic'),
    });
  }

  protected deleteLoading = signal(false);
  protected deleteError = signal<string | null>(null);

  protected deletePlayer() {
    const player = this.player();
    if (!player) return;
    if (!window.confirm('Are you sure you want to delete this player? All their match stats will also be permanently deleted.')) return;
    this.deleteLoading.set(true);
    this.deleteError.set(null);
    this.playerApi.delete(player.id).subscribe({
      next: () => this.router.navigate(['/players']),
      error: () => {
        this.deleteLoading.set(false);
        this.deleteError.set('error.generic');
      },
    });
  }

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

