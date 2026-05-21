import { Component, inject } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatchApi } from '../match-api';
import { SectionContainer } from '../../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-matches-page',
  imports: [SectionContainer, TranslatePipe],
  templateUrl: './matches-page.html',
  styleUrl: './matches-page.scss',
})
export class MatchesPage {
  private api = inject(MatchApi);
  private router = inject(Router);

  private refresh$ = new BehaviorSubject<void>(undefined);

  protected matches = toSignal(
    this.refresh$.pipe(switchMap(() => this.api.getAll())),
  );

  protected onAddMatchClick() {
    this.router.navigate(['/matches/add']);
  }

  protected getMapBackground(map: string): string {
    const name = this.mapName(map);
    const ext = map === 'ANUBIS' ? 'webp' : 'jpg';
    return `url('/maps/${name}.${ext}')`;
  }

  protected getMapLogo(map: string): string {
    const name = this.mapName(map);
    const ext = map === 'ANUBIS' ? 'svg' : 'png';
    return `/maps/${name}Logo.${ext}`;
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private mapName(map: string): string {
    return map.charAt(0) + map.slice(1).toLowerCase();
  }
}
