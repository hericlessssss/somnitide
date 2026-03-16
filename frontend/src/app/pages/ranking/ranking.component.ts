import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { PageContainerComponent } from '../../shared/page-container/page-container.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, RouterLink, PageHeaderComponent, PageContainerComponent],
  template: `
    <app-page-container>
      <app-page-header
        title="Ranking Global"
        subtitle="Os 100 mestres do sono somnitide" />

      <div *ngIf="loading()" class="loading-state">
        <mat-icon class="spin">refresh</mat-icon>
        <span>Sincronizando placares...</span>
      </div>

      <div *ngIf="!loading() && players().length > 0" class="ranking-content">
        <!-- Podium: Top 3 -->
        <div class="podium-section">
          <div *ngFor="let p of podium(); let i = index" 
               [class]="'podium-card rank-' + (i + 1)"
               [routerLink]="['/profile', p.handle]">
            <div class="avatar-container">
              <img [src]="getAvatar(p.avatarSeed)" [alt]="p.handle">
              <div class="rank-badge">{{ i + 1 }}</div>
            </div>
            <div class="player-info">
              <span class="handle" [matTooltip]="p.handle">{{ p.handle }}</span>
              <span class="score">{{ p.totalScore }} pts</span>
            </div>
          </div>
        </div>

        <!-- Top 10: Central Column -->
        <div class="top-list-section">
          <mat-card class="list-card">
            <h2 class="section-title">Lendários (Top 10)</h2>
            <div class="list-items">
              <div *ngFor="let p of top10(); let i = index" 
                   class="list-item"
                   [routerLink]="['/profile', p.handle]">
                <span class="rank-num">{{ i + 4 }}</span>
                <img [src]="getAvatar(p.avatarSeed)" class="small-avatar">
                <span class="handle" [matTooltip]="p.handle">{{ p.handle }}</span>
                <span class="spacer"></span>
                <span class="score">{{ p.totalScore }} pts</span>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Others: Distributed Grid -->
        <div class="grid-section">
          <h2 class="section-title">Elite (11 - 100)</h2>
          <div class="remaining-grid">
            <div *ngFor="let p of others()" 
                 class="grid-item"
                 [routerLink]="['/profile', p.handle]">
              <img [src]="getAvatar(p.avatarSeed)" class="micro-avatar">
              <div class="grid-info">
                <span class="handle" [matTooltip]="p.handle">{{ p.handle }}</span>
                <span class="score">{{ p.totalScore }} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-page-container>
  `,
  styles: [`
    /* Container and header styles removed — now handled by PageContainer + PageHeader */

    /* Podium */
    .podium-section {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
      padding: var(--space-xl) 0;
    }
    .podium-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all var(--transition-fast);
      cursor: pointer;
      position: relative;
    }
    .podium-card:hover {
      transform: translateY(-8px);
      border-color: var(--color-primary);
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
    }
    .rank-1 { order: 2; width: 100%; max-width: 220px; border-color: rgba(255, 215, 0, 0.3); }
    .rank-2 { order: 1; width: 100%; max-width: 180px; }
    .rank-3 { order: 3; width: 100%; max-width: 180px; }

    .avatar-container {
      position: relative;
      margin-bottom: var(--space-md);
    }
    .avatar-container img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 2px solid var(--color-border);
    }
    .rank-1 .avatar-container img { width: 100px; height: 100px; border-color: #ffd700; }
    
    .rank-badge {
      position: absolute;
      bottom: -5px;
      right: -5px;
      background: var(--color-primary);
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14px;
      border: 2px solid var(--color-surface);
    }
    .rank-1 .rank-badge { background: #ffd700; color: #000; }

    .player-info { 
      text-align: center; 
      width: 100%;
      overflow: hidden;
    }
    .player-info .handle { 
      display: block; 
      font-weight: 700; 
      color: var(--color-text); 
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
    .player-info .score { font-size: 13px; color: var(--color-text-muted); }

    /* Top List */
    .top-list-section {
      max-width: 600px;
      margin: 0 auto var(--space-2xl);
    }
    .list-card {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
    }
    .list-card {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
    }
    .list-items { display: flex; flex-direction: column; gap: 8px; }
    .list-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: var(--radius-md);
      transition: background 0.2s;
      cursor: pointer;
    }
    .list-item:hover { background: rgba(255,255,255,0.06); }
    .rank-num { min-width: 30px; font-weight: 600; color: var(--color-text-muted); font-size: 14px; }
    .small-avatar { width: 32px; height: 32px; border-radius: 50%; margin-right: var(--space-md); flex-shrink: 0; }
    .list-item .handle { 
      font-weight: 600; 
      font-size: 15px; 
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: var(--space-sm);
    }
    .spacer { flex: 1; min-width: var(--space-xs); }
    .list-item .score { 
      font-weight: 500; 
      font-size: 14px; 
      color: var(--color-primary); 
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Grid */
    .grid-section { margin-top: var(--space-2xl); }
    .remaining-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .grid-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: all 0.2s;
      cursor: pointer;
    }
    .grid-item:hover { border-color: var(--color-primary); background: rgba(99, 102, 241, 0.05); }
    .micro-avatar { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }
    .grid-info { overflow: hidden; }
    .grid-info .handle { 
      display: block; 
      font-size: 13px; 
      font-weight: 600; 
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .grid-info .score { font-size: 11px; color: var(--color-text-muted); }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-2xl);
      color: var(--color-text-muted);
    }
    .spin { animation: rotate 1.5s linear infinite; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .podium-section { 
        flex-direction: column; 
        align-items: stretch; 
        gap: var(--space-md); 
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
        padding-top: var(--space-sm);
      }
      .rank-1, .rank-2, .rank-3 { order: unset; width: 100%; max-width: unset; }
      .remaining-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
    }
  `]
})
export class RankingComponent implements OnInit {
  private profileService = inject(ProfileService);

  loading = signal(true);
  players = signal<UserProfile[]>([]);

  podium = signal<UserProfile[]>([]);
  top10 = signal<UserProfile[]>([]);
  others = signal<UserProfile[]>([]);

  ngOnInit() {
    this.profileService.getTop100().subscribe({
      next: (data) => {
        this.players.set(data);
        this.podium.set(data.slice(0, 3));
        this.top10.set(data.slice(3, 10));
        this.others.set(data.slice(10));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getAvatar(seed: string): string {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
  }
}
