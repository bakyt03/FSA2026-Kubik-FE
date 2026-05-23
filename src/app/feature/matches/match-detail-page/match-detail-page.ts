import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { MatchApi } from '../match-api';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-match-detail-page',
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './match-detail-page.html',
  styleUrl: './match-detail-page.scss',
})
export class MatchDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private matchApi = inject(MatchApi);

  protected activeTab = signal<'DAMAGE' | 'ADR'>('DAMAGE');

  protected match = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.matchApi.getById(Number(params.get('id')))),
    ),
  );

  protected mapBackground = computed(() => {
    const m = this.match();
    if (!m) return '';
    const name = m.map.charAt(0) + m.map.slice(1).toLowerCase();
    const ext = m.map === 'ANUBIS' ? 'webp' : 'jpg';
    return `url('/maps/${name}.${ext}')`;
  });

  protected getMapLogo = computed(() => {
    const m = this.match();
    if (!m) return '';
    const name = m.map.charAt(0) + m.map.slice(1).toLowerCase();
    const ext = m.map === 'ANUBIS' ? 'svg' : 'png';
    return `/maps/${name}Logo.${ext}`;
  });

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  protected setTab(tab: 'DAMAGE' | 'ADR') {
    this.activeTab.set(tab);
  }

  protected goBack() {
    this.router.navigate(['/matches']);
  }
}
