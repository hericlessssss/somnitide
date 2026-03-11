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
            <img [src]="getAvatar(profile()?.avatarSeed || '')" class="avatar">
            <div class="user-meta">
              <h1 class="handle">{{ profile()?.handle }}</h1>
              <p class="join-date">Membro SomniTide</p>
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
            
            <div class="stat-card">
              <mat-icon>military_tech</mat-icon>
              <div class="stat-info">
                <span class="value">Elite</span>
                <span class="label">Status</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <h2 class="title">Resumo de Atividade</h2>
          <p class="description">
            Este mestre do sono acumulou um total de <strong>{{ profile()?.totalScore }}</strong> pontos 
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
      border: 3px solid var(--color-primary);
    }
    .handle {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
      margin: 0;
      color: var(--color-text);
    }
    .join-date {
      color: var(--color-text-muted);
      font-size: 14px;
      margin: 4px 0 0;
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
}
