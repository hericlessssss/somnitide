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
    <div class="home-container fade-in">
      <main class="content">
        <mat-card class="hero-card glass">
          <mat-card-header class="hero-header">
            <mat-card-title>Status do Sono</mat-card-title>
          </mat-card-header>
          
          <mat-card-content class="hero-content">
            <div class="clock-display">
              <span class="label">Hora Atual</span>
              <h1 class="time">{{ currentTime() | date:'HH:mm:ss' }}</h1>
              <span class="timezone-label">{{ timezoneLabel() }}</span>
            </div>

            <div *ngIf="activeSession(); else noSession" class="active-session-status" role="status" aria-live="polite">
              <div class="status-badge">
                <mat-icon>nights_stay</mat-icon>
                <span>Sessão em andamento</span>
              </div>
              <p class="session-detail">Início: {{ activeSession()?.startedAtUtc | date:'HH:mm' }}</p>
              <p class="session-detail">Sono estimado: {{ activeSession()?.sleepStartEstimatedAtUtc | date:'HH:mm' }}</p>
            </div>
            
            <ng-template #noSession>
              <div class="empty-status">
                <p>Pronto para descansar? Inicie sua sessão de sono para monitorar seu ciclo.</p>
              </div>
            </ng-template>
          </mat-card-content>

          <mat-card-actions class="actions-container">
            <button *ngIf="!activeSession()" 
                    mat-flat-button 
                    color="primary" 
                    class="main-action-btn"
                    (click)="startSession()" 
                    [disabled]="loading()" 
                    aria-label="Iniciar nova sessão de sono">
              <mat-icon>bedtime</mat-icon>
              VOU DORMIR AGORA
            </button>
            <button *ngIf="activeSession()" 
                    mat-flat-button 
                    color="warn" 
                    class="main-action-btn warn"
                    (click)="endSession()" 
                    [disabled]="loading()" 
                    aria-label="Acordar e encerrar sessão de sono">
              <mat-icon>wb_sunny</mat-icon>
              ACORDEI AGORA
            </button>
          </mat-card-actions>
        </mat-card>

        <section *ngIf="activeSession()?.suggestions" class="suggestions-section fade-in">
          <h3 class="section-title">Sugestões de Despertar</h3>
          <div class="suggestions-grid">
            <mat-card *ngFor="let s of sortedSuggestions()" 
                      class="suggestion-card clickable" 
                      [class.recommended]="s.isRecommended" 
                      [class.warning]="s.cycles < 4">
              <mat-card-header>
                <div class="suggestion-header-content">
                  <span class="wake-time">{{ s.wakeTimeUtc | date:'HH:mm' }}</span>
                  <mat-icon *ngIf="s.cycles < 4" class="warning-icon" title="Duração abaixo do recomendado">report_problem</mat-icon>
                </div>
                <mat-card-subtitle class="suggestion-info">
                  {{ s.cycles }} ciclos · {{ (s.cycles * 1.5).toFixed(1) }}h
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="suggestion-body">
                <span *ngIf="s.isRecommended" class="recommended-badge">RECOMENDADO</span>
                <p *ngIf="s.cycles < 4" class="warning-note">Risco de fadiga</p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: `
    .home-container {
      min-height: calc(100vh - var(--bottom-nav-height) - 64px);
      background-color: var(--color-bg);
      display: flex;
      flex-direction: column;
    }

    .content {
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      padding: var(--space-xl) var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
    }

    .glass {
      background: rgba(17, 24, 38, 0.6) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--color-border) !important;
    }

    .hero-card {
      border-radius: var(--radius-lg);
      padding: var(--space-xl) 0;
      text-align: center;
      box-shadow: var(--shadow-2) !important;
    }

    .hero-header {
      justify-content: center;
      margin-bottom: var(--space-lg);
    }

    .hero-header mat-card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2xl);
    }

    .clock-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
    }

    .clock-display .label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .clock-display .time {
      font-size: 5rem;
      font-weight: 800;
      color: var(--color-primary);
      margin: 0;
      line-height: 1;
      font-family: var(--font-title);
      letter-spacing: -2px;
    }

    .timezone-label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      font-weight: 500;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 12px;
      border-radius: 100px;
    }

    .active-session-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-primary);
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: var(--space-xs);
    }

    .status-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .session-detail {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .empty-status p {
      max-width: 280px;
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    .actions-container {
      padding: 0 var(--space-xl) var(--space-lg);
      justify-content: center !important;
    }

    .main-action-btn {
      width: 100%;
      max-width: 320px;
      height: 56px !important;
      border-radius: var(--radius-md) !important;
      font-weight: 700 !important;
      font-size: 1rem !important;
      letter-spacing: 0.5px !important;
      display: flex !important;
      align-items: center;
      gap: 12px;
    }

    .main-action-btn.warn {
      background-color: var(--color-danger) !important;
      color: #fff !important;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-lg);
    }

    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-lg);
    }

    .suggestion-card {
      background: var(--color-surface) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: var(--radius-md) !important;
      padding: var(--space-md) !important;
      transition: all var(--transition-normal);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .suggestion-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .wake-time {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text);
      font-family: var(--font-title);
    }

    .suggestion-info {
      color: var(--color-text-muted) !important;
      font-weight: 500 !important;
      font-size: 0.85rem !important;
      margin-top: 2px !important;
    }

    .recommended-badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--color-primary);
      letter-spacing: 1px;
      border: 1px solid var(--color-primary);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .suggestion-card.recommended {
      border-color: var(--color-primary) !important;
      background: rgba(66, 214, 198, 0.05) !important;
      box-shadow: 0 0 30px rgba(66, 214, 198, 0.05) !important;
    }

    .suggestion-card.warning {
      border-color: rgba(255, 92, 122, 0.3) !important;
    }

    .warning-note {
      color: var(--color-danger);
      font-size: 0.75rem;
      font-weight: 600;
      margin: 8px 0 0;
    }

    .warning-icon {
      color: var(--color-danger);
      font-size: 20px;
    }

    @media (max-width: 600px) {
      .clock-display .time {
        font-size: 4rem;
      }
      .content {
        padding: var(--space-lg) var(--space-md);
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

  timezoneLabel = computed(() => {
    try {
      // Get human readable timezone name if possible, otherwise offset
      const name = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = new Date().getTimezoneOffset();
      const offsetHours = Math.abs(Math.floor(offset / 60));
      const offsetSign = offset <= 0 ? '+' : '-';
      return `${name} (GMT${offsetSign}${offsetHours})`;
    } catch {
      return 'Horário Local';
    }
  });

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
