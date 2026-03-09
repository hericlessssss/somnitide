import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { SleepService, SessionResponse } from '../../services/sleep.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule
  ],
  template: `
    <div class="history-container">
      <header class="section-header fade-in">
        <h1>Seu Histórico</h1>
        <p>A jornada para o seu melhor despertar.</p>
      </header>

      <div *ngIf="loading() && history().length === 0" class="status-state fade-in">
        <div class="loading-shimmer"></div>
        <p>Buscando suas noites de descanso...</p>
      </div>

      <div *ngIf="!loading() && history().length === 0" class="status-state empty fade-in">
        <div class="empty-icon-wrapper">
          <mat-icon ripple>nights_stay</mat-icon>
        </div>
        <h3>O silêncio das estrelas</h3>
        <p>Sua jornada começa aqui. Finalize sua primeira sessão para ver seu histórico!</p>
      </div>

      <div class="history-timeline" *ngIf="history().length > 0">
        <div *ngFor="let session of history()" class="timeline-item fade-in">
          <div class="timeline-connector"></div>
          
          <mat-card class="history-card" 
            [class.border-good]="session.qualityRating && session.qualityRating >= 4"
            [class.border-regular]="session.qualityRating === 3"
            [class.border-bad]="session.qualityRating && session.qualityRating <= 2">
            
            <div class="card-header-premium">
              <div class="session-avatar" aria-hidden="true"
                [class.avatar-good]="session.qualityRating && session.qualityRating >= 4"
                [class.avatar-regular]="session.qualityRating === 3"
                [class.avatar-bad]="session.qualityRating && session.qualityRating <= 2">
                <mat-icon>{{ getQualityIcon(session.qualityRating) }}</mat-icon>
              </div>
              <div class="header-text">
                <div class="card-title-premium" [attr.aria-label]="(session.startedAtUtc | date:'dd') + ' de ' + (session.startedAtUtc | date:'MMMM')">
                  {{ session.startedAtUtc | date:'dd' }} de {{ session.startedAtUtc | date:'MMMM' }}
                </div>
                <div class="card-subtitle-premium" [attr.aria-label]="'Horário: ' + (session.startedAtUtc | date:'HH:mm') + ' até ' + (session.endedAtUtc | date:'HH:mm')">
                  {{ session.startedAtUtc | date:'HH:mm' }} — {{ session.endedAtUtc | date:'HH:mm' }}
                </div>
              </div>
            </div>

            <mat-card-content class="card-body">
              <div class="metrics-row" *ngIf="session.qualityRating" [attr.aria-label]="'Qualidade: ' + session.qualityRating + ' de 5 estrelas'">
                <div class="rating-badge">
                  <div class="stars" aria-hidden="true">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]" [class.filled]="session.qualityRating >= star">
                      {{ session.qualityRating >= star ? 'star' : 'star_outline' }}
                    </mat-icon>
                  </div>
                </div>
              </div>

              <div *ngIf="session.note" class="note-box">
                <p>"{{ session.note }}"</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-2xl) var(--space-md);
      padding-bottom: 120px;
    }
    .section-header {
      margin-bottom: var(--space-2xl);
      text-align: center;
    }
    .section-header h1 { 
      font-family: var(--font-title);
      font-weight: 800; 
      font-size: 2.2rem; 
      color: var(--color-text); 
      margin-bottom: var(--space-xs);
      letter-spacing: -1px;
    }
    .section-header p { 
      color: var(--color-text-muted); 
      font-size: 1rem;
      font-weight: 500;
    }

    /* Timeline Structure */
    .history-timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      position: relative;
    }

    .timeline-item {
      position: relative;
      display: flex;
      gap: var(--space-lg);
    }

    .timeline-connector {
      position: absolute;
      left: 24px;
      top: 60px;
      bottom: -20px;
      width: 2px;
      background: linear-gradient(to bottom, var(--color-border), transparent);
      opacity: 0.5;
    }
    .timeline-item:last-child .timeline-connector { display: none; }

    /* Premium Glass Cards */
    .history-card {
      flex: 1;
      background: rgba(17, 24, 38, 0.4) !important;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid var(--color-border) !important;
      border-left-width: 4px !important;
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      transition: all var(--transition-normal);
      overflow: hidden;
    }
    .history-card:hover {
      transform: translateX(4px);
      background: rgba(17, 24, 38, 0.6) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }

    /* Quality Semantic Borders */
    .border-good { border-left-color: var(--color-primary) !important; }
    .border-regular { border-left-color: var(--color-warning) !important; }
    .border-bad { border-left-color: var(--color-danger) !important; }

    .session-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--color-surface-2);
      transition: all var(--transition-fast);
    }
    .avatar-good { color: var(--color-primary); background: rgba(66, 214, 198, 0.1); }
    .avatar-regular { color: var(--color-warning); background: rgba(255, 200, 87, 0.1); }
    .avatar-bad { color: var(--color-danger); background: rgba(255, 92, 122, 0.1); }

    .card-header-premium {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      margin-bottom: var(--space-md);
    }

    .header-text { display: flex; flex-direction: column; gap: 4px; }
    .card-title-premium { 
      font-family: var(--font-title); 
      font-weight: 700;
      font-size: 1.2rem; 
      color: var(--color-text); 
      margin: 0;
      line-height: 1.2;
    }
    .card-subtitle-premium { 
      color: var(--color-text-muted); 
      font-size: 0.85rem;
      font-weight: 600; 
    }

    .card-body { padding: var(--space-md) 0 0; }
    
    .stars { display: flex; color: rgba(255,255,255,0.05); gap: 2px; }
    .stars mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .stars mat-icon.filled { color: var(--color-warning); filter: drop-shadow(0 0 4px rgba(255, 200, 87, 0.3)); }

    .note-box {
      margin-top: var(--space-md);
      background: rgba(255, 255, 255, 0.03);
      padding: var(--space-md);
      border-radius: var(--radius-md);
    }
    .note-box p {
      margin: 0;
      color: var(--color-text-muted);
      font-style: italic;
      line-height: 1.4;
      font-size: 0.9rem;
    }

    /* Empty State Refinement */
    .status-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px var(--space-xl);
      text-align: center;
      color: var(--color-text-muted);
    }
    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      background: var(--color-surface-2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-xl);
      border: 1px solid var(--color-border);
    }
    .empty-icon-wrapper mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.5; }
    .status-state h3 { color: var(--color-text); font-weight: 700; margin-bottom: var(--space-sm); }
    .status-state p { max-width: 320px; line-height: 1.6; }
  `]

})
export class HistoryComponent implements OnInit {
  private sleepService = inject(SleepService);

  history = signal<SessionResponse[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.sleepService.getHistory(20).subscribe({
      next: (res) => {
        this.history.set(res.history);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading history', err);
        this.loading.set(false);
      }
    });
  }

  getQualityIcon(rating: number | null): string {
    if (!rating) return 'sentiment_neutral';
    if (rating >= 4) return 'sentiment_very_satisfied';
    if (rating === 3) return 'sentiment_satisfied';
    return 'sentiment_dissatisfied';
  }
}
