import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatchApi } from '../match-api';
import { PlayerApi } from '../../players/player-api';
import { TranslatePipe } from '@ngx-translate/core';

function isValidCsScore(s1: number, s2: number): boolean {
  const max = Math.max(s1, s2);
  const min = Math.min(s1, s2);
  // Regulation: first to 13, win by at least 2
  if (max === 13 && min >= 0 && min <= 11) return true;
  // OT: winner = 12 + 4n, loser in [12 + 3*(n-1), winner - 2]
  for (let n = 1; n <= 20; n++) {
    const win = 12 + 4 * n;
    const loMin = 12 + 3 * (n - 1);
    const loMax = win - 2;
    if (max === win && min >= loMin && min <= loMax) return true;
  }
  return false;
}

function csScoreValidator(control: AbstractControl): ValidationErrors | null {
  const s1 = (control as FormGroup).get('team1Score')?.value;
  const s2 = (control as FormGroup).get('team2Score')?.value;
  if (s1 == null || s2 == null) return null;
  return isValidCsScore(s1, s2) ? null : { invalidScore: true };
}

type PlayerRowGroup = FormGroup<{
  playerId: FormControl<number | null>;
  kills: FormControl<number>;
  deaths: FormControl<number>;
  damage: FormControl<number>;
}>;

@Component({
  selector: 'app-add-match-page',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './add-match-page.html',
  styleUrl: './add-match-page.scss',
})
export class AddMatchPage {
  private router = inject(Router);
  private matchApi = inject(MatchApi);
  private playerApi = inject(PlayerApi);

  protected readonly maps = ['MIRAGE', 'INFERNO', 'DUST2', 'NUKE', 'ANUBIS', 'ANCIENT', 'OVERPASS'];
  protected activeTab = signal<'DAMAGE' | 'ADR'>('DAMAGE');
  protected allPlayers = toSignal(this.playerApi.getAll(), { initialValue: [] });

  protected form = new FormGroup(
    {
      map: new FormControl<string>('MIRAGE', { nonNullable: true, validators: [Validators.required] }),
      playedAt: new FormControl<string>(new Date().toISOString().split('T')[0], {
        nonNullable: true,
        validators: [Validators.required],
      }),
      team1Score: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      team2Score: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      team1Players: new FormArray<PlayerRowGroup>(Array.from({ length: 5 }, () => this.createPlayerRow())),
      team2Players: new FormArray<PlayerRowGroup>(Array.from({ length: 5 }, () => this.createPlayerRow())),
    },
    { validators: [csScoreValidator] },
  );

  protected selectedMap = toSignal(this.form.controls.map.valueChanges, { initialValue: 'MIRAGE' });

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected availablePlayersFor = computed(() => {
    this.formValue(); // track form changes
    const all = this.allPlayers();

    const selectedIds = (skipTeam: 'team1Players' | 'team2Players', skipIndex: number): Set<number> => {
      const ids = new Set<number>();
      (['team1Players', 'team2Players'] as const).forEach((team) => {
        this.form.controls[team].controls.forEach((row, i) => {
          if (team === skipTeam && i === skipIndex) return;
          const v = row.controls.playerId.value;
          if (v != null) ids.add(v);
        });
      });
      return ids;
    };

    return {
      team1: this.form.controls.team1Players.controls.map((_, i) =>
        all.filter((p) => !selectedIds('team1Players', i).has(p.id)),
      ),
      team2: this.form.controls.team2Players.controls.map((_, i) =>
        all.filter((p) => !selectedIds('team2Players', i).has(p.id)),
      ),
    };
  });

  protected mapBackground = computed(() => {
    const map = this.selectedMap();
    const name = map.charAt(0) + map.slice(1).toLowerCase();
    const ext = map === 'ANUBIS' ? 'webp' : 'jpg';
    return `url('/maps/${name}.${ext}')`;
  });

  protected setTab(tab: 'DAMAGE' | 'ADR') {
    this.activeTab.set(tab);
  }

  protected getStatDisplay(damage: number): string {
    if (this.activeTab() === 'ADR') {
      const rounds =
        ((this.form.controls.team1Score.value ?? 0) + (this.form.controls.team2Score.value ?? 0)) || 1;
      return (damage / rounds).toFixed(1);
    }
    return String(damage);
  }

  protected resetDate() {
    this.form.controls.playedAt.setValue(new Date().toISOString().split('T')[0]);
  }

  private createPlayerRow(): PlayerRowGroup {
    return new FormGroup({
      playerId: new FormControl<number | null>(null),
      kills: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
      deaths: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
      damage: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    });
  }

  protected submit() {
    const v = this.form.getRawValue();
    this.matchApi
      .create({
        map: v.map,
        playedAt: v.playedAt,
        team1Score: v.team1Score ?? 0,
        team2Score: v.team2Score ?? 0,
        team1Players: v.team1Players
          .filter((p) => p.playerId != null)
          .map((p) => ({ playerId: p.playerId!, kills: p.kills, deaths: p.deaths, damage: p.damage })),
        team2Players: v.team2Players
          .filter((p) => p.playerId != null)
          .map((p) => ({ playerId: p.playerId!, kills: p.kills, deaths: p.deaths, damage: p.damage })),
      })
      .subscribe({
        next: () => this.router.navigate(['/matches']),
        error: () => {},
      });
  }
}
