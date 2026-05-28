import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { PlayerApi } from '../player-api';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './create-player-modal.html',
})
export class CreatePlayerModal {
  private modal = inject(NgbActiveModal);
  private playerApi = inject(PlayerApi);

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    nickname: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  protected nicknameTaken = signal(false);
  protected loading = signal(false);

  protected close() {
    this.modal.dismiss();
  }

  protected onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.nicknameTaken.set(false);
    this.loading.set(true);

    this.playerApi
      .create({
        name: this.form.value.name!,
        nickname: this.form.value.nickname!,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.modal.close('created');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 409) {
            this.nicknameTaken.set(true);
          }
        },
      });
  }
}
