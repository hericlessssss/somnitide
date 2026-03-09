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
      <header class="section-header">
        <h1>Seu Histórico de Sono</h1>
        <p>Acompanhe a jornada para uma vida mais descansada.</p>
      </header>

      <div *ngIf="loading() && history().length === 0" class="status-state">
        <p>Buscando suas noites de descanso...</p>
      </div>

      <div *ngIf="!loading() && history().length === 0" class="status-state empty">
        <mat-icon>nights_stay</mat-icon>
        <p>Sua jornada começa aqui. Finalize sua primeira sessão para ver seu histórico!</p>
      </div>

      <div class="history-list">
        <mat-card *ngFor="let session of history()" class="history-card">
          <mat-card-header>
            <div mat-card-avatar class="session-avatar" [class.good]="session.qualityRating && session.qualityRating >= 3">
              <mat-icon>{{ session.qualityRating && session.qualityRating >= 3 ? 'sentiment_satisfied' : 'sentiment_dissatisfied' }}</mat-icon>
            </div>
            <mat-card-title>{{ session.startedAtUtc | date:'dd ' }} de {{ session.startedAtUtc | date:'MMMM' }}</mat-card-title>
            <mat-card-subtitle>
              {{ session.startedAtUtc | date:'HH:mm' }} às {{ session.endedAtUtc | date:'HH:mm' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="card-body">
            <div class="metrics-row">
              <div class="rating-badge" *ngIf="session.qualityRating">
                <div class="stars">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" [class.filled]="session.qualityRating >= star">
                    {{ session.qualityRating >= star ? 'star' : 'star_outline' }}
                  </mat-icon>
                </div>
                <span class="rating-text">Qualidade</span>
              </div>
            </div>

            <div *ngIf="session.note" class="note-box">
              <mat-icon>short_text</mat-icon>
              <p>"{{ session.note }}"</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 700px;
      margin: 48px auto;
      padding: 0 24px;
    }
    .section-header {
      margin-bottom: 48px;
      text-align: center;
    }
    .section-header h1 { 
      font-weight: 300; 
      font-size: 2.8rem; 
      color: #1a237e; 
      margin-bottom: 12px; 
      letter-spacing: -0.5px;
    }
    .section-header p { 
      color: #7986cb; 
      font-size: 1.1rem;
      font-weight: 400;
    }

    .status-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 80px;
      color: #999;
      text-align: center;
    }
    .status-state.empty mat-icon { 
      font-size: 5rem; 
      height: 5rem; 
      width: 5rem; 
      color: #e8eaf6;
      margin-bottom: 24px; 
    }
    .status-state p { font-size: 1.1rem; max-width: 300px; }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .history-card {
      border-radius: 20px;
      padding: 12px;
      border: 1px solid #f0f2f5;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      transition: all 0.3s ease;
    }
    .history-card:hover {
      box-shadow: 0 8px 30px rgba(26, 35, 126, 0.08);
      transform: translateY(-2px);
    }
    .session-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffebee;
      color: #e53935;
      border-radius: 12px;
    }
    .session-avatar.good {
      background-color: #e8eaf6;
      color: #3f51b5;
    }
    .card-body {
      padding: 16px 8px 8px;
    }
    .metrics-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 16px;
    }
    .rating-badge {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stars { display: flex; color: #e0e0e0; gap: 2px; }
    .stars mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .stars mat-icon.filled { color: #fbc02d; }
    .rating-text {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      font-weight: 600;
    }

    .note-box {
      display: flex;
      gap: 12px;
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 12px;
      align-items: flex-start;
    }
    .note-box mat-icon { color: #999; font-size: 20px; width: 20px; height: 20px; }
    .note-box p {
      margin: 0;
      font-style: italic;
      color: #444;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    mat-card-title { font-size: 1.25rem !important; color: #1a237e; }
    mat-card-subtitle { color: #7986cb; font-weight: 500; }
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
}
