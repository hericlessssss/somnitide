import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SleepService, SessionResponse } from '../../services/sleep.service';
import { AuthService } from '../../services/auth.service';
import { AssessmentDialogComponent, AssessmentResult } from './components/assessment-dialog/assessment-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatSnackBarModule
  ],
  template: `
    <div class="home-container">
      <main class="content">
        <mat-card class="hero-card">
          <mat-card-header>
            <mat-card-title>Status do Sono</mat-card-title>
          </mat-card-header>
          <mat-card-content class="hero-content">
            <div class="current-time">
              <span class="label">Hora Atual (Local)</span>
              <span class="time">{{ currentTime() | date:'HH:mm:ss' }}</span>
            </div>

            <div *ngIf="activeSession(); else noSession" class="active-session-info">
              <p>Sessão iniciada em: {{ activeSession()?.startedAtUtc | date:'HH:mm' }}</p>
              <p>Início do sono estimado: {{ activeSession()?.sleepStartEstimatedAtUtc | date:'HH:mm' }}</p>
            </div>
            <ng-template #noSession>
              <p>Clique no botão abaixo quando for deitar para receber as melhores sugestões de despertar.</p>
            </ng-template>
          </mat-card-content>
          <mat-card-actions class="actions-center">
            <button *ngIf="!activeSession()" mat-fab extended color="primary" (click)="startSession()" [disabled]="loading()">
              <mat-icon>bedtime</mat-icon>
              Vou dormir agora
            </button>
            <button *ngIf="activeSession()" mat-fab extended color="warn" (click)="endSession()" [disabled]="loading()">
              <mat-icon>sunny</mat-icon>
              Acordei agora
            </button>
          </mat-card-actions>
        </mat-card>

        <section *ngIf="activeSession()?.suggestions" class="suggestions-section">
          <h3>Sugestões de Despertar</h3>
          <div class="suggestions-grid">
            <mat-card *ngFor="let s of sortedSuggestions()" class="suggestion-card" [class.recommended]="s.isRecommended" [class.warning]="s.cycles < 4">
              <mat-card-header>
                <mat-card-title>
                  <span class="wake-time">{{ s.wakeTimeUtc | date:'HH:mm' }}</span>
                  <mat-icon *ngIf="s.cycles < 4" class="warning-icon" title="Duração abaixo do recomendado (mínimo 6h)">report_problem</mat-icon>
                </mat-card-title>
                <mat-card-subtitle class="suggestion-subtitle">{{ s.cycles }} ciclos ({{ (s.cycles * 1.5).toFixed(1) }}h)</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="suggestion-body">
                <p *ngIf="s.isRecommended" class="recommended-text">RECOMENDADO</p>
                <p *ngIf="s.cycles < 4" class="warning-text">Pouco sono. Risco de fadiga.</p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: `
    .home-container {
      min-height: calc(100vh - 64px);
      background-color: var(--bg-primary);
    }

    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-xl) var(--space-md);
    }

    .hero-card {
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: var(--space-xl);
    }
    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-2xl) 0;
    }
    .current-time {
      text-align: center;
      margin-bottom: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .current-time .label { 
      font-size: 0.75rem; 
      color: var(--color-text-muted); 
      text-transform: uppercase; 
      letter-spacing: 2px;
      font-weight: 700;
    }
    .current-time .time { 
      font-size: 5.5rem; 
      font-weight: 800; 
      color: var(--color-primary); 
      line-height: 1;
      font-family: var(--font-title);
      letter-spacing: -3px;
      /* Removed neon glow per user request */
    }

    .suggestions-section h3 {
      font-family: var(--font-title);
      font-weight: 700;
      color: var(--text-header);
      margin-bottom: var(--space-lg);
      text-align: center;
    }
    .active-session-info {
      text-align: center;
      margin-bottom: var(--space-xl);
      color: var(--color-text-muted);
      line-height: 1.25;
    }
    .active-session-info p {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-md);
      justify-content: center;
    }
    .suggestion-card { 
      border-radius: var(--radius-md); 
      transition: all var(--transition-fast);
      background-color: var(--bg-surface) !important;
      border: 1px solid var(--border) !important;
    }
    .suggestion-card:hover {
      transform: translateY(-4px);
      background-color: var(--bg-surface-hover) !important;
      box-shadow: var(--shadow-md) !important;
    }
    .suggestion-card.recommended {
      border: 1px solid var(--color-primary) !important;
      background: rgba(66, 214, 198, 0.04) !important;
      box-shadow: 0 0 20px rgba(66, 214, 198, 0.05) !important;
    }
    .suggestion-card.warning {
      border: 1px solid rgba(255, 200, 87, 0.3) !important;
    }
    .wake-time {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-header);
    }
    .suggestion-subtitle {
      color: var(--text-main) !important; /* Higher contrast */
      font-weight: 600 !important;
      font-size: 0.9rem !important;
      opacity: 1 !important;
      margin-top: 4px;
    }
    .suggestion-body {
      padding-top: 8px;
    }
    .recommended-text {
      color: var(--primary);
      font-weight: 800;
      font-size: 0.75rem;
      letter-spacing: 1px;
    }
    .warning-icon {
      font-size: 20px;
      vertical-align: middle;
      color: var(--warning);
      margin-left: var(--space-xs);
    }
    .warning-text {
      font-size: 0.8rem;
      color: var(--warning);
      font-weight: 700;
      margin-top: var(--space-xs);
    }
    .actions-center {
      display: flex;
      justify-content: center;
      padding-bottom: var(--space-lg);
    }
    
    @media (max-width: 600px) {
      .current-time .time {
        font-size: 3.5rem;
      }
      .suggestions-grid {
        grid-template-columns: 1fr;
      }
    }
  `


})
export class HomeComponent {
  auth = inject(AuthService);
  private sleepService = inject(SleepService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  currentTime = signal(new Date());
  activeSession = signal<SessionResponse | null>(null);
  loading = signal(false);

  sortedSuggestions = computed(() => {
    const session = this.activeSession();
    if (!session?.suggestions) return [];

    return [...session.suggestions].sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return 0; // Maintain relative order if neither or both are recommended
    });
  });

  constructor() {
    setInterval(() => this.currentTime.set(new Date()), 1000);

    // Only refresh status once authenticated
    effect(() => {
      if (this.auth.isAuthenticated) {
        this.refreshStatus();
      }
    });
  }

  refreshStatus() {
    this.sleepService.getHistory(1).subscribe({
      next: (res) => {
        this.activeSession.set(res.activeSession);
      },
      error: (err) => console.error('Failed to load status', err)
    });
  }

  startSession() {
    this.loading.set(true);
    this.sleepService.startSession().subscribe({
      next: (res) => {
        this.activeSession.set(res);
        this.loading.set(false);
        this.snack.open('Bons sonhos! Sessão iniciada.', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open('Erro ao iniciar sessão.', 'Fechar', { duration: 5000 });
      }
    });
  }

  endSession() {
    const dialogRef = this.dialog.open(AssessmentDialogComponent, {
      width: '550px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: AssessmentResult | undefined) => {
      if (!result) return;

      this.loading.set(true);
      this.sleepService.endSession(result.qualityRating, result.note).subscribe({
        next: () => {
          this.activeSession.set(null);
          this.loading.set(false);
          this.snack.open('Bem-vindo de volta! Sessão finalizada.', 'OK', { duration: 3000 });
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open('Erro ao finalizar sessão.', 'Fechar', { duration: 5000 });
        }
      });
    });
  }
}
