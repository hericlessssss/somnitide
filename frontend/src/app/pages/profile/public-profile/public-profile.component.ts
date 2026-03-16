import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProfileService, UserProfile } from '../../../services/profile.service';

import { PageContainerComponent } from '../../../shared/page-container/page-container.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink, PageContainerComponent],
  template: `
    <app-page-container>
      <div class="profile-layout">
        <div *ngIf="loading()" class="loading-state">
          <mat-icon class="spin">refresh</mat-icon>
          <span>Carregando perfil...</span>
        </div>

        <div *ngIf="!loading() && profile()" class="profile-content fade-in">
          <div class="profile-nav">
            <button mat-icon-button routerLink="/ranking" class="back-btn" aria-label="Voltar para o ranking">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <span class="nav-title">Perfil do Usuário</span>
          </div>

        <div class="profile-layout" *ngIf="profile() as user">
        <!-- Intelligent Header: User Info & Core Stats -->
        <div class="profile-header-card" [class]="getRankClass(user.rankPosition)">
          <div class="user-main-info">
            <div class="avatar-container">
              <img [src]="getAvatar(user.avatarSeed)" [alt]="user.handle" class="avatar">
              <div class="rank-badge">{{ getRankShortTitle(user.rankPosition) }}</div>
            </div>
            <div class="user-details">
              <h2 class="display-name">{{ user.handle.startsWith('@') ? user.handle : '@' + user.handle }}</h2>
              <div class="member-since">
                <mat-icon>calendar_today</mat-icon>
                Membro desde {{ user.createdAtUtc | date:'MMM yyyy' }}
              </div>
            </div>
          </div>
  
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Pontos</span>
              <span class="stat-value">{{ user.totalScore | number }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-label">Nível Atual</span>
              <span class="stat-value">{{ getRankShortTitle(user.rankPosition) }}</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Grid: Activity Summary & Deep Insights -->
        <div class="profile-dashboard-grid">
          <div class="dashboard-card activity-summary">
            <div class="card-header">
              <mat-icon>analytics</mat-icon>
              <h3>Resumo de Atividade</h3>
            </div>
            
            <div class="metrics-row">
              <div class="metric-box">
                <span class="metric-label">Posição Global</span>
                <span class="metric-value highlight">#{{ user.rankPosition }}</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Última Atividade</span>
                <span class="metric-value">{{ getLastActive() }}</span>
              </div>
            </div>

            <div class="activity-footer">
              <p>Métricas baseadas no desempenho global e consistência das sessões de sono.</p>
            </div>
          </div>

          <div class="dashboard-card insights-card">
            <div class="card-header">
              <mat-icon>auto_awesome</mat-icon>
              <h3>Insights do Sono</h3>
            </div>
            
            <div class="insights-preview">
              <div class="insight-item">
                <div class="insight-info">
                  <span class="insight-label">Score Médio</span>
                  <span class="insight-value">{{ user.avgScore != null ? (user.avgScore | number:'1.0-0') : '--' }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="user.avgScore || 0"></div>
                </div>
              </div>

              <div class="insight-item">
                <div class="insight-info">
                  <span class="insight-label">Última Noite</span>
                  <span class="insight-value">{{ formatMinutes(user.lastSleepMinutes) }}</span>
                </div>
                <div class="insight-trend">
                  <mat-icon>local_fire_department</mat-icon>
                  <span>{{ user.streakDays || 0 }} dias de sequência</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>

        <div *ngIf="!loading() && !profile()" class="error-state">
          <mat-icon>search_off</mat-icon>
          <h2>Perfil não encontrado</h2>
          <button mat-flat-button color="primary" routerLink="/ranking">Voltar ao Ranking</button>
        </div>
      </div>
    </app-page-container>
  `,
  styles: [`
    .profile-layout {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 var(--space-md);
    }
    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 32px; /* Increased for better breathing room */
    }

    /* Premium Header Card */
    .profile-header-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-2xl);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      margin-bottom: var(--space-xl);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    .profile-header-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--color-primary);
    }

    /* Rank Colors */
    .rank-legendary::before { background: var(--color-warning); }
    .rank-elite::before { background: #a78bfa; }
    .rank-master::before { background: var(--color-primary); }
    .rank-supreme::before { background: #ffd700; }

    .user-main-info {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
    }
    .avatar-container {
      position: relative;
      flex-shrink: 0;
    }
    .avatar {
      width: 88px;
      height: 88px;
      border-radius: var(--radius-md);
      background: var(--color-bg);
      border: 2px solid var(--color-border);
      object-fit: cover;
    }
    .rank-badge {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .display-name {
      font-size: 1.75rem;
      font-weight: 900;
      letter-spacing: -1px;
      margin: 0;
    }
    .user-handle {
      display: block;
      color: var(--color-primary);
      font-weight: 600;
      font-size: 0.9rem;
      margin-top: -4px;
    }
    .member-since {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--color-text-muted);
      margin-top: 8px;
    }
    .member-since mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .header-stats {
      display: flex;
      align-items: center;
      gap: var(--space-2xl);
      background: rgba(255, 255, 255, 0.03);
      padding: var(--space-xl);
      border-radius: var(--radius-md);
    }
    .stat-divider { width: 1px; height: 40px; background: var(--color-border); }
    .stat-item { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--color-text-muted); font-weight: 600; }
    .stat-value { font-size: 1.25rem; font-weight: 800; }

    /* Dashboard Grid */
    .profile-dashboard-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-xl);
    }
    .dashboard-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .card-header { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      margin-bottom: 4px;
    }
    .card-header mat-icon { 
      color: var(--color-primary); 
      font-size: 22px;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-header h3 { 
      font-size: 1.1rem; 
      font-weight: 800; 
      letter-spacing: -0.5px; 
      margin: 0;
      line-height: normal;
    }

    .metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .metric-box {
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .metric-label { font-size: 11px; font-weight: 600; color: var(--color-text-muted); }
    .metric-value { font-size: 1.1rem; font-weight: 800; }
    .metric-value.highlight { color: var(--color-primary); }

    .activity-footer { border-top: 1px solid var(--color-border); padding-top: var(--space-md); }
    .activity-footer p { font-size: 11px; color: var(--color-text-muted); line-height: 1.4; }

    .insights-card { background: linear-gradient(135deg, var(--color-surface), #131b2b); }
    .insights-preview {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      flex: 1;
    }
    .insight-item { display: flex; flex-direction: column; gap: 8px; }
    .insight-info { display: flex; justify-content: space-between; align-items: flex-end; }
    .insight-label { font-size: 12px; color: var(--color-text-muted); font-weight: 600; }
    .insight-value { font-size: 1rem; font-weight: 800; color: var(--color-text); }
    
    .progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), #4fd1c5);
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(66, 214, 198, 0.3);
    }

    .insight-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #4fd1c5;
      font-size: 11px;
      font-weight: 600;
    }
    .insight-trend.negative { color: var(--color-danger); }
    .insight-trend mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .empty-state { /* Simplified empty state for insights */
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      opacity: 0.5;
      text-align: center;
    }
    .empty-state mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .empty-state p { font-size: 12px; font-weight: 500; }

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

    .profile-nav {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .nav-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    .back-btn { 
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid var(--color-border) !important;
      width: 40px !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: var(--color-primary) !important;
    }

    @media (max-width: 768px) {
      .profile-dashboard-grid { grid-template-columns: 1fr; }
      .header-stats { flex-direction: column; align-items: flex-start; }
      .stat-divider { display: none; }
      .metrics-row { grid-template-columns: 1fr; }
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

  getLastActive(): string {
    const p = this.profile();
    if (!p || !p.updatedAtUtc) return '-';
    
    const lastDate = new Date(p.updatedAtUtc);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - lastDate.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Há ${diffMins}m`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return `Há ${diffDays}d`;
  }

  getRankTitle(pos?: number): string {
    if (!pos) return 'Membro somnitide';
    if (pos === 1) return 'Mestre Supremo do Sono';
    if (pos === 2) return 'Mestre do Sono';
    if (pos === 3) return 'Guardião do Descanso';
    if (pos <= 10) return 'Lendário do Sono';
    if (pos <= 100) return 'Elite do Sono';
    return 'Membro somnitide';
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
    if (!pos) return 'rank-member';
    if (pos === 1) return 'rank-supreme';
    if (pos === 2) return 'rank-master';
    if (pos === 3) return 'rank-guardian';
    if (pos <= 10) return 'rank-legendary';
    if (pos <= 100) return 'rank-elite';
    return 'rank-member';
  }

  formatMinutes(minutes?: number): string {
    if (minutes === undefined || minutes === null) return '--';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
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
