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
        <h2>Seu Histórico de Sono</h2>
        <p>Acompanhe a qualidade das suas últimas noites.</p>
      </header>

      <div *ngIf="loading() && history().length === 0" class="loading-state">
        <p>Carregando seu histórico...</p>
      </div>

      <div *ngIf="!loading() && history().length === 0" class="empty-state">
        <mat-icon>history_toggle_off</mat-icon>
        <p>Você ainda não finalizou nenhuma sessão de sono.</p>
      </div>

      <div class="history-list">
        <mat-card *ngFor="let session of history()" class="history-card">
          <mat-card-header>
            <div mat-card-avatar class="session-avatar">
              <mat-icon>{{ session.qualityRating && session.qualityRating >= 3 ? 'sentiment_satisfied' : 'sentiment_dissatisfied' }}</mat-icon>
            </div>
            <mat-card-title>{{ session.startedAtUtc | date:'dd/MM/yyyy' }}</mat-card-title>
            <mat-card-subtitle>
              {{ session.startedAtUtc | date:'HH:mm' }} - {{ session.endedAtUtc | date:'HH:mm' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="card-body">
            <div class="rating-info" *ngIf="session.qualityRating">
              <span class="label">Qualidade:</span>
              <div class="stars">
                <mat-icon *ngFor="let star of [1,2,3,4,5]" [color]="session.qualityRating >= star ? 'primary' : ''">
                  {{ session.qualityRating >= star ? 'star' : 'star_border' }}
                </mat-icon>
              </div>
            </div>

            <p *ngIf="session.note" class="note">
               <mat-icon>notes</mat-icon>
               <span>"{{ session.note }}"</span>
            </p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .history-container {
      max-width: 800px;
      margin: 32px auto;
      padding: 0 16px;
    }
    .section-header {
      margin-bottom: 32px;
      text-align: center;
    }
    .section-header h2 { font-weight: 300; font-size: 2.5rem; color: #3f51b5; margin-bottom: 8px; }
    .section-header p { color: #666; font-size: 1.1rem; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 64px;
      color: #999;
    }
    .empty-state mat-icon { font-size: 4rem; height: 4rem; width: 4rem; margin-bottom: 16px; }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .history-card {
      border-radius: 12px;
      transition: transform 0.2s;
    }
    .history-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .session-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #e8eaf6;
      border-radius: 50%;
      color: #3f51b5;
    }
    .card-body {
      padding: 16px 0;
    }
    .rating-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .rating-info .label { font-weight: 500; color: #555; }
    .stars { display: flex; color: #ffca28; }
    .stars mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .note {
      display: flex;
      gap: 8px;
      font-style: italic;
      color: #666;
      margin: 0;
      align-items: flex-start;
    }
    .note mat-icon { font-size: 18px; width: 18px; height: 18px; margin-top: 2px; }
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
