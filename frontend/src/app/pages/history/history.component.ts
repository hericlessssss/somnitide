import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule
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
                <div class="card-title-premium">
                  {{ session.startedAtUtc | date:'dd' }} de {{ session.startedAtUtc | date:'MMMM' }}
                </div>
                <!-- Time and Duration Info -->
                <div class="time-meta-group">
                  <div class="card-subtitle-premium">
                    <mat-icon class="tiny-icon">access_time</mat-icon>
                    {{ session.startedAtUtc | date:'HH:mm' }} — {{ session.endedAtUtc | date:'HH:mm' }}
                  </div>
                  <div class="duration-badge" *ngIf="session.endedAtUtc">
                    <mat-icon class="tiny-icon">bedtime</mat-icon>
                    Tempo dormido: {{ calculateDuration(session.startedAtUtc, session.endedAtUtc) }}
                  </div>
                </div>
              </div>
            </div>

            <mat-card-content class="card-body">
              <div class="metrics-row" *ngIf="session.qualityRating">
                <div class="rating-badge">
                  <div class="stars" aria-hidden="true">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]" [class.filled]="session.qualityRating >= star">
                      {{ session.qualityRating >= star ? 'star' : 'star_outline' }}
                    </mat-icon>
                  </div>
                </div>
              </div>

              <div class="note-box" [class.no-note]="!session.note || session.note === 'Avaliação concluída'">
                <p>
                  <mat-icon class="quote-icon">format_quote</mat-icon>
                  {{ (session.note && session.note !== 'Avaliação concluída') ? session.note : 'Sem observações' }}
                </p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Pagination -->
        <div class="pagination-footer" *ngIf="hasMore()">
          <button mat-flat-button class="load-more-btn" (click)="loadMore()" [disabled]="loading()">
            <mat-icon *ngIf="!loading()">add</mat-icon>
            <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
            <span>{{ loading() ? 'CARREGANDO...' : 'VER MAIS HISTÓRICO' }}</span>
          </button>
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

    .header-text { display: flex; flex-direction: column; gap: 8px; }
    .card-title-premium { 
      font-family: var(--font-title); 
      font-weight: 700;
      font-size: 1.25rem; 
      color: var(--color-text); 
      margin: 0;
      line-height: 1.2;
    }
    .time-meta-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .card-subtitle-premium { 
      color: var(--color-primary); 
      font-size: 0.9rem;
      font-weight: 700; 
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .duration-badge {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0.8;
    }
    .tiny-icon {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
    }

    .card-body { padding: var(--space-md) 0 0; }
    
    .stars { display: flex; color: rgba(255,255,255,0.05); gap: 2px; }
    .stars mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .stars mat-icon.filled { color: var(--color-warning); filter: drop-shadow(0 0 4px rgba(255, 200, 87, 0.3)); }

    .note-box {
      margin-top: var(--space-lg);
      background: rgba(255, 255, 255, 0.03);
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      border: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
    }
    .note-box.no-note {
      opacity: 0.5;
      font-size: 0.85rem;
    }
    .note-box p {
      margin: 0;
      color: var(--color-text-muted);
      font-style: italic;
      line-height: 1.5;
      font-size: 0.95rem;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .quote-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--color-primary);
      opacity: 0.5;
      margin-top: 2px;
    }

    .pagination-footer {
      display: flex;
      justify-content: center;
      margin-top: var(--space-2xl);
      padding-top: var(--space-xl);
    }
    .load-more-btn {
      background: var(--color-surface-2) !important;
      color: var(--color-text) !important;
      border: 1px solid var(--color-border) !important;
      height: 48px !important;
      padding: 0 var(--space-xl) !important;
      border-radius: var(--radius-md) !important;
      font-weight: 700 !important;
      letter-spacing: 1px !important;
      font-size: 0.85rem !important;
      display: flex !important;
      align-items: center;
      gap: 8px;
      transition: all var(--transition-fast) !important;
    }
    .load-more-btn:hover:not(:disabled) {
      background: var(--color-border) !important;
      transform: translateY(-2px);
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
  limit = signal(10);
  hasMore = signal(true);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.sleepService.getHistory(this.limit()).subscribe({
      next: (res) => {
        this.history.set(res.history);
        this.hasMore.set(res.history.length === this.limit());
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading history', err);
        this.loading.set(false);
      }
    });
  }

  loadMore() {
    this.limit.update(l => l + 10);
    this.loadHistory();
  }

  calculateDuration(start: string, end: string): string {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    
    if (diffMs <= 0) return '0h 0min';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}min`;
  }

  getQualityIcon(rating: number | null): string {
    if (!rating) return 'sentiment_neutral';
    if (rating >= 4) return 'sentiment_very_satisfied';
    if (rating === 3) return 'sentiment_satisfied';
    return 'sentiment_dissatisfied';
  }
}
