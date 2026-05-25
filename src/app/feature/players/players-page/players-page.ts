import { Component, inject } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { PlayerApi } from '../player-api';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { CreatePlayerModal } from '../create-player-modal/create-player-modal';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../../user.service';

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
