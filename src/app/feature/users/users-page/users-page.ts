import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, startWith, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { UserManagementApi } from '../user-management-api';

@Component({
  selector: 'app-users-page',
  imports: [ReactiveFormsModule, TranslatePipe, SectionContainer],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage {
  private userManagementApi = inject(UserManagementApi);

  private refresh$ = new Subject<void>();
  protected users = toSignal(
    this.refresh$.pipe(
      startWith(null),
      switchMap(() => this.userManagementApi.getKeycloakUsers()),
    ),
  );
  protected deleteLoading = signal<string | null>(null);

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  protected loading = signal(false);
  protected success = signal(false);
  protected error = signal<string | null>(null);

  protected onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.success.set(false);
    this.error.set(null);

    const { email, password } = this.form.value;
    this.userManagementApi.createUser(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('conflict');
        } else {
          this.error.set('generic');
        }
      },
    });
  }

  protected deleteUser(id: string) {
    if (!window.confirm('Are you sure you want to delete this user? Their player profile will be unlinked.')) return;
    this.deleteLoading.set(id);
    this.userManagementApi.deleteUser(id).subscribe({
      next: () => {
        this.deleteLoading.set(null);
        this.refresh$.next();
      },
      error: () => this.deleteLoading.set(null),
    });
  }
}
