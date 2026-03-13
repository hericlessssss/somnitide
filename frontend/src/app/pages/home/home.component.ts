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
import { PreferencesService } from '../../services/preferences.service';
import { AssessmentDialogComponent, AssessmentResult } from './components/assessment-dialog/assessment-dialog.component';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { PageContainerComponent } from '../../shared/page-container/page-container.component';

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
    MatSnackBarModule,
    RouterLink,
    MatIconModule,
    PageHeaderComponent,
    PageContainerComponent
  ],
  template: `
    <app-page-container>
      <!-- Etapa 3: Título real da página —
           Não está dentro do card. O card é só o relógio. -->
      <app-page-header
        title="Status do Sono"
        subtitle="Pronto para dormir? Inicie sua sessão." />

      <main class="content">
        <!-- Science Brief (Now a simple text block ABOVE the clock) -->
        <section class="science-brief-section fade-in">
          <div class="science-text">
            <p>O SomniTide utiliza algoritmos baseados na arquitetura cíclica do sono para estimar seus horários ideais.</p>
            <a routerLink="/docs" class="science-link">Clique aqui e entenda como podemos ajudar.</a>
          </div>
        </section>

        <mat-card class="hero-card glass">
          <mat-card-content class="hero-content">
            <!-- 1. The Clock (Primary Focus) -->
            <div class="clock-display">
              <span class="label">Hora Atual</span>
              <h1 class="time">{{ currentTime() | date:'HH:mm:ss' }}</h1>
              <span class="timezone-label">{{ timezoneLabel() }}</span>
            </div>

            <!-- 2. Primary Action Button -->
            <div class="actions-container">
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
            </div>

            <!-- 3. Secondary Status Text (Below the button) -->
            <div *ngIf="activeSession(); else noSession" class="status-container active-session-status" role="status" aria-live="polite">
              <div class="status-badge">
                <mat-icon>nights_stay</mat-icon>
                <span>Sessão em andamento</span>
              </div>
              <p class="session-detail">Início: {{ activeSession()?.startedAtUtc | date:'HH:mm' }}</p>
              <p class="session-detail">Sono estimado: {{ activeSession()?.sleepStartEstimatedAtUtc | date:'HH:mm' }}</p>
            </div>
            
            <ng-template #noSession>
              <div class="status-container empty-status">
                <p>Nenhuma sessão ativa.</p>
              </div>
            </ng-template>

          </mat-card-content>
        </mat-card>

        <section *ngIf="activeSession()?.suggestions" class="suggestions-section fade-in">
          <div class="section-header">
            <h3 class="section-title">Sugestões de Despertar</h3>
          </div>

          <!-- Pinned Recommended Suggestion -->
          <div *ngIf="recommendedSuggestion() as s" class="pinned-suggestion">
            <mat-card class="suggestion-card recommended hero-suggestion clickable">
              <div class="card-accent"></div>
              <div class="suggestion-content">
                <div class="suggestion-header-row">
                  <div class="cycles-group">
                    <span class="cycles-badge">{{ s.cycles }} ciclos</span>
                    <span class="separator">·</span>
                    <span class="duration-value">{{ formatDuration(s.cycles * 1.5) }}</span>
                  </div>
                </div>

                <div class="suggestion-body-row">
                  <div class="time-container">
                    <span class="wake-time">{{ s.wakeTimeUtc | date:'HH:mm' }}</span>
                    <span class="duration-label">Ideal para você</span>
                  </div>
                  
                  <div class="badge-group">
                    <mat-icon class="star-icon">stars</mat-icon>
                    <span class="recommended-badge">RECOMENDADO</span>
                  </div>
                </div>
              </div>
              
              <mat-card-content class="health-alert-container" *ngIf="getHealthStatus(s.cycles) as status">
                <div class="health-alert" [class]="status.level">
                  <mat-icon>{{ status.icon }}</mat-icon>
                  <span>{{ status.message }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="other-suggestions-outer">
            <h4 class="sub-section-title">Outras opções</h4>
            <div class="suggestions-grid">
              <mat-card *ngFor="let s of nonRecommendedSuggestions()" 
                        class="suggestion-card clickable small-card" 
                        [class]="getHealthStatus(s.cycles).level">
                <div class="suggestion-content">
                  <div class="suggestion-header-row">
                    <div class="cycles-group">
                      <span class="cycles-badge">{{ s.cycles }} ciclos</span>
                      <span class="separator">·</span>
                      <span class="duration-value">{{ formatDuration(s.cycles * 1.5) }}</span>
                    </div>
                  </div>
                  
                  <div class="suggestion-body-row">
                    <div class="time-container">
                      <span class="wake-time">{{ s.wakeTimeUtc | date:'HH:mm' }}</span>
                      <span class="health-tag" *ngIf="s.cycles < 4 || s.cycles > 6">
                        {{ getHealthStatus(s.cycles).label }}
                      </span>
                    </div>
                    
                    <div class="status-group" *ngIf="s.cycles < 4 || s.cycles > 6">
                      <mat-icon [class]="getHealthStatus(s.cycles).level + '-icon'">
                        {{ getHealthStatus(s.cycles).icon }}
                      </mat-icon>
                    </div>
                  </div>
                </div>
              </mat-card>
            </div>
          </div>
        </section>
      </main>
    </app-page-container>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    /* Page container handled by PageContainer component */
    .home-container { }

    .content {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px; /* Reduced internal gap for 1-line look */
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

    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2xl); /* This gap naturally spaces the 3 main flow items: clock, button, status */
      padding: var(--space-xl) var(--space-xl) var(--space-md) var(--space-xl);
    }

    .clock-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
    }

    .clock-display .label {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .clock-display .time {
      font-size: clamp(4.18rem, 17.6vw, 6.05rem);
      font-weight: 900;
      color: var(--color-primary);
      margin: 0;
      line-height: 1;
      font-family: var(--font-title);
      letter-spacing: -3px;
    }

    .timezone-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-weight: 500;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 12px;
      border-radius: 100px;
    }

    /* Actions container is now inline flex child, not a card-action footer */
    .actions-container {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .main-action-btn {
      width: 100%;
      max-width: 320px;
      height: 56px !important;
      border-radius: var(--radius-md) !important;
      font-weight: 700 !important;
      font-size: 0.9rem !important;
      letter-spacing: 0.5px !important;
      display: flex !important;
      align-items: center;
      gap: 12px;
    }

    .main-action-btn.warn {
      background-color: var(--color-danger) !important;
      color: #fff !important;
    }

    /* Status Container at the bottom */
    .status-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: var(--space-md);
      width: 100%;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-primary);
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: var(--space-xs);
    }

    .status-badge mat-icon {
      font-size: 19px;
      width: 20px;
      height: 20px;
    }

    .session-detail {
      margin: 0;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .empty-status p {
      max-width: 280px;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-md);
    }

    .pinned-suggestion {
      margin-bottom: var(--space-xl);
    }

    .hero-suggestion {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--color-primary) !important;
      background: linear-gradient(135deg, rgba(66, 214, 198, 0.12) 0%, rgba(66, 214, 198, 0.04) 100%) !important;
      padding: var(--space-lg) !important;
    }

    .suggestion-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      width: 100%;
    }

    .suggestion-header-row {
      display: flex;
      align-items: center;
      width: 100%;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: var(--space-sm);
    }

    .cycles-group {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .separator {
      color: var(--color-text-muted);
      opacity: 0.5;
    }

    .suggestion-body-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .time-container {
      display: flex;
      flex-direction: column;
    }

    .badge-group {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .cycles-badge {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .duration-value {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 500;
      white-space: nowrap;
    }

    .wake-time {
      font-size: clamp(2rem, 10vw, 2.65rem);
      font-weight: 900;
      color: var(--color-text);
      font-family: var(--font-title);
      line-height: 1;
      letter-spacing: -1px;
    }

    .duration-label {
      font-size: 0.65rem;
      color: var(--color-primary);
      font-weight: 700;
      margin-top: 6px;
      letter-spacing: 0.5px;
    }

    .status-group {
      display: flex;
      align-items: center;
    }

    .star-icon {
      color: var(--color-primary);
      font-size: 27px;
      width: 28px;
      height: 28px;
    }

    .recommended-badge {
      font-size: 0.55rem;
      font-weight: 800;
      color: var(--color-primary);
      letter-spacing: 0.5px;
      border: 1.5px solid var(--color-primary);
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .health-alert-container {
      margin-top: var(--space-lg) !important;
      padding: 0 !important;
    }

    .health-alert {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .health-alert.critical {
      border-left: 3px solid var(--color-danger);
      background: rgba(255, 92, 122, 0.05);
      color: var(--color-danger);
    }

    .health-alert.warning {
      border-left: 3px solid var(--color-warning);
      background: rgba(255, 200, 87, 0.05);
      color: var(--color-warning);
    }

    .health-alert.info {
      border-left: 3px solid var(--color-primary);
      color: var(--color-text-muted);
    }

    .health-tag {
      font-size: 0.55rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .health-tag.critical { color: var(--color-danger); }
    .health-tag.warning { color: var(--color-warning); }

    .small-card {
      padding: var(--space-lg) !important;
    }

    .small-card .wake-time {
      font-size: 1.9rem;
    }

    .small-card.critical { border-color: rgba(255, 92, 122, 0.2) !important; }
    .small-card.warning { border-color: rgba(255, 200, 87, 0.2) !important; }

    .warning-icon {
      color: var(--color-warning);
      font-size: 23px;
    }

    .critical-icon {
      color: var(--color-danger);
      font-size: 23px;
    }

    .small-card.critical { border-color: rgba(255, 92, 122, 0.2) !important; }
    .small-card.warning { border-color: rgba(255, 200, 87, 0.2) !important; }

    .suggestion-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .wake-time {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--color-text);
      font-family: var(--font-title);
    }

    .suggestion-info {
      color: var(--color-text-muted) !important;
      font-weight: 500 !important;
      font-size: 0.75rem !important;
      margin-top: 2px !important;
    }

    .recommended-badge {
      display: inline-block;
      font-size: 0.55rem;
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
      font-size: 0.65rem;
      font-weight: 600;
      margin: 8px 0 0;
    }

    .warning-icon {
      color: var(--color-danger);
      font-size: 19px;
    }

    @media (max-width: 600px) {
      .clock-display .time {
        font-size: 4rem;
      }
      .suggestions-grid {
        grid-template-columns: 1fr;
      }
    }

    .science-brief-section {
      width: 100%;
    }

    .science-card {
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      width: 100%;
      text-align: left;
    }

    .science-text p {
      font-size: 0.78rem; /* Smaller as requested */
      color: var(--color-text-muted);
      opacity: 0.7; /* More discrete */
      line-height: 1.4;
      margin: 0 0 4px 0;
    }

    .science-link {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
      transition: opacity var(--transition-fast);
      display: inline-block;
    }

    .science-link:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  `


})
export class HomeComponent {
  auth = inject(AuthService);
  private sleepService = inject(SleepService);
  private preferencesService = inject(PreferencesService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  currentTime = signal(new Date());
  activeSession = signal<SessionResponse | null>(null);
  cycleLength = signal<number>(90); // Default fallback
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

  recommendedSuggestion = computed(() => {
    return this.activeSession()?.suggestions?.find(s => s.isRecommended) || null;
  });

  nonRecommendedSuggestions = computed(() => {
    return this.activeSession()?.suggestions
      ?.filter(s => !s.isRecommended)
      ?.sort((a, b) => a.cycles - b.cycles) || [];
  });

  formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}min`;
  }

  getHealthStatus(cycles: number): { level: string, icon: string, message: string, label: string } {
    if (cycles <= 2) {
      return {
        level: 'critical',
        icon: 'dangerous',
        message: 'Duração crítica. Alto risco de comprometimento cognitivo e fadiga severa.',
        label: 'Crítico'
      };
    }
    if (cycles === 3) {
      return {
        level: 'critical',
        icon: 'error_outline',
        message: 'Sono insuficiente. Risco de irritabilidade e baixa concentração.',
        label: 'Insuficiente'
      };
    }
    if (cycles === 4) {
      return {
        level: 'warning',
        icon: 'report_problem',
        message: 'Abaixo do recomendado. Pode causar sonolência diurna.',
        label: 'Mínimo'
      };
    }
    if (cycles >= 5 && cycles <= 6) {
      return {
        level: 'info',
        icon: 'check_circle_outline',
        message: '7h 30min é a duração padrão ouro para recuperação total.',
        label: 'Ideal'
      };
    }
    return {
      level: 'warning',
      icon: 'info_outline',
      message: 'Sono prolongado. Pode resultar em inércia do sono ao despertar.',
      label: 'Longo'
    };
  }

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

    this.preferencesService.getPreferences().subscribe({
      next: (prefs) => {
        this.cycleLength.set(prefs.cycleLengthMinutes);
      },
      error: (err) => console.error('Failed to load preferences', err)
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
    const session = this.activeSession();
    if (!session) return;

    const sleepStart = new Date(session.sleepStartEstimatedAtUtc).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - sleepStart) / (1000 * 60);

    // Check if at least one cycle has passed
    if (elapsedMinutes < this.cycleLength()) {
      this.loading.set(true);
      this.sleepService.endSession(null, 'Sessão muito curta').subscribe({
        next: () => {
          this.activeSession.set(null);
          this.loading.set(false);
          this.snack.open('Notamos que você ainda não completou um ciclo de sono. Que pena que não conseguiu dormir ainda! Esta sessão não será computada.', 'OK', {
            duration: 8000,
            panelClass: ['info-snackbar']
          });
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open('Erro ao finalizar sessão.', 'Fechar', { duration: 5000 });
        }
      });
      return;
    }

    const dialogRef = this.dialog.open(AssessmentDialogComponent, {
      width: '550px',
      disableClose: true,
      autoFocus: false,
      backdropClass: 'assessment-dialog-backdrop'
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
