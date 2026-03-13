import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProfileService, UserProfile } from '../../../services/profile.service';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="profile-layout">
      <div *ngIf="loading()" class="loading-state">
        <mat-icon class="spin">refresh</mat-icon>
        <span>Carregando perfil...</span>
      </div>

      <div *ngIf="!loading() && profile()" class="profile-content fade-in">
        <button mat-icon-button routerLink="/ranking" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>

        <mat-card class="user-header-card">
          <div class="user-header">
            <img [src]="getAvatar(profile()?.avatarSeed || '')" 
                 class="avatar" [class]="getRankClass(profile()?.rankPosition)">
            <div class="user-meta">
              <h1 class="handle gradient-text">{{ profile()?.handle }}</h1>
              <p class="join-date" [class]="getRankClass(profile()?.rankPosition)">
                {{ getRankTitle(profile()?.rankPosition) }}
              </p>
              <p class="member-since" *ngIf="profile()?.createdAtUtc">
                membro desde {{ profile()?.createdAtUtc | date:'MMMM yyyy' }}
              </p>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <mat-icon>emoji_events</mat-icon>
              <div class="stat-info">
                <span class="value">{{ profile()?.totalScore }}</span>
                <span class="label">Pontos Totais</span>
              </div>
            </div>
            
            <div class="stat-card" [class]="getRankClass(profile()?.rankPosition)">
              <mat-icon>{{ getRankIcon(profile()?.rankPosition) }}</mat-icon>
              <div class="stat-info">
                <span class="value">{{ getRankShortTitle(profile()?.rankPosition) }}</span>
                <span class="label">Status</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <h2 class="title">Resumo de Atividade</h2>
          <p class="description">
            Este {{ getRankShortTitle(profile()?.rankPosition).toLowerCase() }} do sono acumulou um total de <strong>{{ profile()?.totalScore }}</strong> pontos 
            otimizando seus ciclos de descanso.
          </p>
          <div class="achievements">
            <div class="achievement-icon" matTooltip="Participante do Ranking">
              <mat-icon>stars</mat-icon>
            </div>
          </div>
        </mat-card>
      </div>

      <div *ngIf="!loading() && !profile()" class="error-state">
        <mat-icon>search_off</mat-icon>
        <h2>Perfil não encontrado</h2>
        <button mat-flat-button color="primary" routerLink="/ranking">Voltar ao Ranking</button>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 var(--space-md);
    }
    .user-header-card {
      background: var(--color-surface) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: var(--radius-lg);
      padding: var(--space-2xl);
      margin-bottom: var(--space-lg);
    }
    .user-header {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      margin-bottom: var(--space-2xl);
    }
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 4px solid var(--color-border);
      transition: all var(--transition-md);
      object-fit: cover;
    }
    .avatar.rank-supreme { 
      border-color: #ffd700; 
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
      animation: gold-glow-avatar 3s infinite alternate;
    }
    .avatar.rank-master { border-color: #c0c0c0; box-shadow: 0 0 15px rgba(192, 192, 192, 0.3); }
    .avatar.rank-guardian { border-color: #cd7f32; box-shadow: 0 0 12px rgba(205, 127, 50, 0.3); }
    .avatar.rank-legend { border-color: var(--color-primary); box-shadow: 0 0 10px rgba(99, 102, 241, 0.3); }
    .avatar.rank-elite { border-color: #42d6c6; }

    @keyframes gold-glow-avatar {
      from { box-shadow: 0 0 10px rgba(255, 215, 0, 0.2), inset 0 0 5px rgba(255, 215, 0, 0.1); }
      to { box-shadow: 0 0 25px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.2); }
    }
    .handle {
      font-size: clamp(2.64rem, 8.8vw, 3.52rem);
      font-weight: 900;
      letter-spacing: -2px;
      margin: 0;
    }
    .join-date {
      color: var(--color-text-muted);
      font-size: 14px;
      margin: 4px 0 0;
    }
    .member-since {
      color: var(--color-text-muted);
      font-size: 11px;
      opacity: 0.6;
      margin: 2px 0 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      background: rgba(255,255,255,0.03);
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    .stat-card mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--color-primary);
    }
    .stat-info { display: flex; flex-direction: column; }
    .stat-info .value { font-size: 20px; font-weight: 700; color: var(--color-text); }
    .stat-info .label { font-size: 12px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 1px; }

    .summary-card {
      background: rgba(255,255,255,0.02) !important;
      border: 1px solid var(--color-border) !important;
      padding: var(--space-xl);
    }
    .summary-card .title { font-size: 18px; font-weight: 700; margin-bottom: var(--space-md); }
    .summary-card .description { color: var(--color-text-muted); line-height: 1.6; }

    /* Rank Styles */
    .rank-supreme { 
      color: #ffd700 !important; 
      font-weight: 800; 
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
      animation: gold-glow 3s infinite alternate;
    }
    .rank-master { color: #c0c0c0 !important; font-weight: 700; }
    .rank-guardian { color: #cd7f32 !important; font-weight: 700; }
    .rank-legend { color: var(--color-primary) !important; font-weight: 700; }
    .rank-elite { color: #42d6c6 !important; font-weight: 600; }

    .stat-card.rank-supreme { 
      border-color: #ffd700; 
      background: rgba(255, 215, 0, 0.05);
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
    }
    .stat-card.rank-supreme mat-icon { color: #ffd700; }
    .stat-card.rank-master { border-color: #c0c0c0; background: rgba(192, 192, 192, 0.05); }
    .stat-card.rank-master mat-icon { color: #c0c0c0; }
    .stat-card.rank-guardian { border-color: #cd7f32; background: rgba(205, 127, 50, 0.05); }
    .stat-card.rank-guardian mat-icon { color: #cd7f32; }

    @keyframes gold-glow {
      from { text-shadow: 0 0 5px rgba(255, 215, 0, 0.2); }
      to { text-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-2xl);
      text-align: center;
      color: var(--color-text-muted);
    }
    .spin { animation: rotate 1.5s linear infinite; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .back-btn { margin-bottom: var(--space-md); }

    @media (max-width: 480px) {
      .user-header { flex-direction: column; text-align: center; }
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  
  profile = signal<UserProfile | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const handle = params['handle'];
      if (handle) {
        this.loadProfile(handle);
      }
    });
  }

  loadProfile(handle: string) {
    this.loading.set(true);
    this.profileService.getPublicProfile(handle).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getAvatar(seed: string): string {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
  }

  getRankTitle(pos?: number): string {
    if (!pos) return 'Membro SomniTide';
    if (pos === 1) return 'Mestre Supremo do Sono';
    if (pos === 2) return 'Mestre do Sono';
    if (pos === 3) return 'Guardião do Descanso';
    if (pos <= 10) return 'Lendário do Sono';
    if (pos <= 100) return 'Elite do Sono';
    return 'Membro SomniTide';
  }

  getRankShortTitle(pos?: number): string {
    if (!pos) return 'Membro';
    if (pos === 1) return 'Supremo';
    if (pos === 2) return 'Mestre';
    if (pos === 3) return 'Guardião';
    if (pos <= 10) return 'Lendário';
    if (pos <= 100) return 'Elite';
    return 'Membro';
  }

  getRankClass(pos?: number): string {
    if (!pos) return '';
    if (pos === 1) return 'rank-supreme';
    if (pos === 2) return 'rank-master';
    if (pos === 3) return 'rank-guardian';
    if (pos <= 10) return 'rank-legend';
    if (pos <= 100) return 'rank-elite';
    return '';
  }

  getRankIcon(pos?: number): string {
    if (!pos) return 'person';
    if (pos === 1) return 'workspace_premium';
    if (pos === 2) return 'military_tech';
    if (pos === 3) return 'verified';
    if (pos <= 10) return 'stars';
    if (pos <= 100) return 'emoji_events';
    return 'person';
  }
}
