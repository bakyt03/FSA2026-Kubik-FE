import { Component, computed, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatchApi } from '../match-api';
import { PlayerApi } from '../../players/player-api';
import { TranslatePipe } from '@ngx-translate/core';

type PlayerRowGroup = FormGroup<{
  playerId: FormControl<number | null>;
  kills: FormControl<number>;
  deaths: FormControl<number>;
  damage: FormControl<number>;
}>;

@Component({
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './add-match-modal.html',
})
export class AddMatchModal {
  private activeModal = inject(NgbActiveModal);
  private matchApi = inject(MatchApi);
  private playerApi = inject(PlayerApi);

  protected readonly maps = ['MIRAGE', 'INFERNO', 'DUST2', 'NUKE', 'ANUBIS', 'ANCIENT', 'OVERPASS'];

  protected allPlayers = toSignal(this.playerApi.getAll(), { initialValue: [] });

  protected form = new FormGroup({
    map: new FormControl<string>('MIRAGE', { nonNullable: true, validators: [Validators.required] }),
    playedAt: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    team1Score: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    team2Score: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    team1Players: new FormArray<PlayerRowGroup>([]),
    team2Players: new FormArray<PlayerRowGroup>([]),
  });

  protected selectedMap = toSignal(this.form.controls.map.valueChanges, { initialValue: 'MIRAGE' });

  protected mapBackground = computed(() => {
    const map = this.selectedMap();
    const name = map.charAt(0) + map.slice(1).toLowerCase();
    const ext = map === 'ANUBIS' ? 'webp' : 'jpg';
    return `url('/maps/${name}.${ext}')`;
  });

  protected addPlayerRow(team: 'team1Players' | 'team2Players') {
    const row: PlayerRowGroup = new FormGroup({
      playerId: new FormControl<number | null>(null, [Validators.required]),
      kills: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
      deaths: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
      damage: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    });
    this.form.controls[team].push(row);
  }

  protected removePlayerRow(team: 'team1Players' | 'team2Players', index: number) {
    this.form.controls[team].removeAt(index);
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.matchApi.create({
      map: v.map,
      playedAt: v.playedAt,
      team1Score: v.team1Score,
      team2Score: v.team2Score,
      team1Players: v.team1Players.map((p) => ({
        playerId: p.playerId!,
        kills: p.kills,
        deaths: p.deaths,
        damage: p.damage,
      })),
      team2Players: v.team2Players.map((p) => ({
        playerId: p.playerId!,
        kills: p.kills,
        deaths: p.deaths,
        damage: p.damage,
      })),
    }).subscribe({
      next: () => this.activeModal.close('created'),
      error: () => {},
    });
  }

  protected cancel() {
    this.activeModal.dismiss();
  }
}
