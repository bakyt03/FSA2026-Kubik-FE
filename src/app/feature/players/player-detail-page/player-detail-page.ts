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
