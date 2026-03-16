import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProgressService, ProgressResponse } from '../../services/progress.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { PageContainerComponent } from '../../shared/page-container/page-container.component';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent,
    PageContainerComponent
  ],
  template: `
    <app-page-container>
      <app-page-header
        title="Seu Progresso"
        subtitle="Acompanhe os números da sua jornada" />


      <div *ngIf="loading() && !data()" class="status-state fade-in">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        <p>Analisando seus ciclos de descanso...</p>
      </div>

      <div *ngIf="!loading() && !data()" class="status-state empty fade-in">
        <div class="empty-icon-wrapper">
          <mat-icon>history_toggle_off</mat-icon>
        </div>
        <h3>O início da evolução</h3>
        <p>Ainda não há sessões suficientes para calcular seu progresso completo.</p>
        <button mat-flat-button color="primary" class="start-btn" routerLink="/home">
           COMEÇAR AGORA
        </button>
      </div>

      <ng-container *ngIf="data()">
        <!-- Core Stats: Grid layout matching history items gap -->
        <div class="stats-timeline fade-in">
          
          <div class="stats-grid">
            <mat-card class="premium-card glass score-main">
              <div class="card-accent"></div>
              <div class="card-inner">
                <header class="premium-header">
                  <mat-icon class="status-icon avatar-good">stars</mat-icon>
                  <div class="header-text">
                    <div class="section-title">Score Médio</div>
                    <div class="sub-section-title">Últimos {{ data()?.rangeDays }} dias</div>
                  </div>
                </header>
                <div class="card-body">
                  <div class="score-display">
                    <span class="score-value">{{ data()?.avgScore | number:'1.0-0' }}</span>
                    <span class="score-total">/110</span>
                  </div>
                  <div class="rank-badge">
                    {{ getRankLabel(data()?.avgScore || 0) }}
                  </div>
                </div>
              </div>
            </mat-card>

            <mat-card class="premium-card glass streak-main">
              <div class="card-inner">
                <header class="premium-header">
                  <mat-icon class="status-icon avatar-regular">local_fire_department</mat-icon>
                  <div class="header-text">
                    <div class="section-title">Sequência</div>
                    <div class="sub-section-title">Dias consecutivos</div>
                  </div>
                </header>
                <div class="card-body">
                  <div class="streak-display">
                    <span class="streak-value">{{ data()?.streakDays }}</span>
                    <span class="streak-unit">dias</span>
                  </div>
                  <div class="streak-note">Mantendo o ritmo! 🔥</div>
                </div>
              </div>
            </mat-card>

            <mat-card class="premium-card glass total-score">
              <div class="card-inner">
                <header class="premium-header">
                  <mat-icon class="status-icon avatar-accent">emoji_events</mat-icon>
                  <div class="header-text">
                    <div class="section-title">Pontos no Período</div>
                    <div class="sub-section-title">Últimos {{ data()?.rangeDays }} dias</div>
                  </div>
                </header>
                <div class="card-body">
                  <div class="total-display">
                    <span class="total-value">{{ data()?.totalScore | number:'1.0-0' }}</span>
                    <span class="total-unit">pts</span>
                  </div>
                  <div class="total-note">Rumo ao topo! 🚀</div>
                </div>
              </div>
            </mat-card>
          </div>

          <div class="secondary-metrics">
            <div class="metric-mini glass">
              <mat-icon>access_time</mat-icon>
              <div class="metric-info">
                <span class="label">MÉDIA DE SONO</span>
                <span class="value">{{ formatSleepMinutes(data()?.avgSleepMinutes || 0) }}</span>
              </div>
            </div>
            <div class="metric-mini glass">
              <mat-icon>emoji_events</mat-icon>
              <div class="metric-info">
                <span class="label">MELHOR NOITE</span>
                <span class="value">{{ data()?.bestDay?.score || 0 }} pts</span>
              </div>
            </div>
          </div>

          <!-- History Section Refined as Timeline -->
          <section class="nights-history">
            <h2 class="sub-section-title">Últimas Noites</h2>
            
            <div class="timeline-list">
              <div *ngFor="let day of data()?.days" class="timeline-day fade-in">
                <div class="timeline-connector"></div>
                <mat-card class="day-card glass" 
                  [class.border-good]="day.totalScore >= 80"
                  [class.border-regular]="day.totalScore >= 60 && day.totalScore < 80"
                  [class.border-bad]="day.totalScore < 60">
                  
                  <div class="day-header">
                    <div class="day-date-group">
                      <span class="date-day">{{ day.date | date:'dd' }}</span>
                      <span class="date-month">{{ day.date | date:'MMM' }}</span>
                    </div>
                    
                    <div class="day-content">
                      <div class="day-top-row">
                        <span class="day-score-sum">{{ day.totalScore }} pts</span>
                        <div class="pills-container">
                          <span class="pill duration">D: {{ day.durationScore }}</span>
                          <span class="pill quality">Q: {{ day.qualityScore }}</span>
                          <span class="pill streak" *ngIf="day.streakBonus > 0">+{{ day.streakBonus }}</span>
                        </div>
                      </div>
                      <div class="day-bottom-row">
                        <mat-icon class="tiny-icon">bedtime</mat-icon>
                        <span class="day-meta-info">
                          {{ formatSleepMinutes(day.sleepMinutes) }} • {{ day.rating || 'N/A' }} estrelas
                        </span>
                      </div>
                    </div>
                  </div>
                </mat-card>
              </div>
            </div>
          </section>

          <footer class="score-footer fade-in">
            <p>O Score somnitide V1 é calculado com base na Duração (máx 60pts), Qualidade (máx 40pts) e Sequência (bônus 10pts). O seu rank reflete a sua consistência semanal.</p>
          </footer>
        </div>
      </ng-container>
    </app-page-container>
  `,
  styles: [`
    /* Container + header now handled by PageContainer / PageHeader */
    .progress-container { }

    /* Glass Effect from Home/History */
    .glass {
      background: rgba(17, 24, 38, 0.4) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--color-border) !important;
    }

    /* Status States */
    .status-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px var(--space-xl);
      text-align: center;
      color: var(--color-text-muted);
    }
    .status-state p { max-width: 320px; line-height: 1.6; margin-top: var(--space-lg); }
    .empty-icon-wrapper {
      width: 80px; height: 80px;
      background: var(--color-surface-2);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-xl);
      border: 1px solid var(--color-border);
    }
    .empty-icon-wrapper mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.5; }
    .status-state h3 { color: var(--color-text); font-weight: 700; margin-bottom: var(--space-sm); }
    
    .start-btn {
      margin-top: var(--space-xl);
      height: 48px !important;
      padding: 0 var(--space-2xl) !important;
      font-weight: 700 !important;
      border-radius: var(--radius-md) !important;
    }

    /* Stats Grid */
    .stats-timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-lg);
    }

    .premium-card {
      border-radius: var(--radius-lg);
      position: relative;
      overflow: hidden;
      transition: transform var(--transition-normal);
    }
    .premium-card:hover { transform: translateY(-4px); }

    .card-inner {
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    .card-accent {
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: var(--color-primary);
      opacity: 0.8;
    }

    .premium-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-lg);
    }

    .status-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-good { color: var(--color-primary); }
    .avatar-regular { color: var(--color-warning); }
    .avatar-accent { color: #A272FF; }

    .header-text { display: flex; flex-direction: column; gap: 4px; }
    .card-body { 
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .score-display { display: flex; align-items: baseline; gap: 4px; }
    .score-value { font-size: 3rem; font-weight: 900; color: var(--color-text); line-height: 1; font-family: var(--font-title); }
    .score-total { font-size: 1.1rem; color: var(--color-text-muted); font-weight: 600; }

    .rank-badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(66, 214, 198, 0.1);
      color: var(--color-primary);
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .streak-display { display: flex; align-items: baseline; gap: 6px; margin-bottom: var(--space-md); }
    .streak-value { font-size: 3rem; font-weight: 900; color: var(--color-warning); line-height: 1; font-family: var(--font-title); }
    .streak-unit { font-size: 1.1rem; color: var(--color-text-muted); font-weight: 600; }
    .streak-note { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500; }

    .total-display { display: flex; align-items: baseline; gap: 6px; }
    .total-value { font-size: 3rem; font-weight: 900; color: #A272FF; line-height: 1; font-family: var(--font-title); }
    .total-unit { font-size: 1.1rem; color: var(--color-text-muted); font-weight: 600; }
    .total-note { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500; }

    /* Secondary Metrics */
    .secondary-metrics {
      display: flex;
      gap: var(--space-md);
      flex-wrap: wrap;
    }
    .metric-mini {
      flex: 1;
      min-width: 150px;
      padding: var(--space-md);
      display: flex;
      align-items: center;
      gap: var(--space-md);
      border-radius: var(--radius-md);
    }
    .metric-mini mat-icon { color: var(--color-text-muted); opacity: 0.6; }
    .metric-info { display: flex; flex-direction: column; }
    .metric-info .label { font-size: 0.6rem; color: var(--color-text-muted); font-weight: 700; letter-spacing: 0.5px; }
    .metric-info .value { font-size: 0.9rem; color: var(--color-text); font-weight: 700; }

    /* Timeline List */
    .nights-history { margin-top: var(--space-xl); }

    .timeline-list { display: flex; flex-direction: column; gap: var(--space-md); position: relative; }
    .timeline-day { position: relative; }
    .timeline-connector {
      position: absolute; left: 24px; top: 48px; bottom: -16px; width: 2px;
      background: linear-gradient(to bottom, var(--color-border), transparent);
      opacity: 0.3;
    }
    .timeline-day:last-child .timeline-connector { display: none; }

    .day-card {
      margin-left: 0;
      border-left-width: 4px !important;
      padding: var(--space-md);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    .day-card:hover { transform: translateX(4px); background: rgba(17, 24, 38, 0.6) !important; }

    .border-good { border-left-color: var(--color-primary) !important; }
    .border-regular { border-left-color: var(--color-warning) !important; }
    .border-bad { border-left-color: var(--color-danger) !important; }

    .day-header { display: flex; align-items: center; gap: var(--space-lg); }
    .day-date-group {
      display: flex; flex-direction: column; align-items: center; min-width: 48px;
    }
    .date-day { font-size: 1.2rem; font-weight: 900; color: var(--color-text); line-height: 1; }
    .date-month { font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; }

    .day-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .day-top-row { display: flex; justify-content: space-between; align-items: center; }
    .day-score-sum { font-size: 1rem; font-weight: 700; color: var(--color-text); }
    .day-bottom-row { display: flex; align-items: center; gap: 6px; }
    .day-meta-info { font-size: 0.75rem; color: var(--color-text-muted); font-weight: 500; }

    .pills-container { display: flex; gap: 4px; }
    .pill {
      font-size: 0.55rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;
    }
    .pill.duration { background: rgba(66, 214, 198, 0.1); color: var(--color-primary); }
    .pill.quality { background: rgba(162, 114, 255, 0.1); color: #A272FF; }
    .pill.streak { background: rgba(255, 126, 87, 0.1); color: var(--color-warning); }

    .tiny-icon { font-size: 14px; width: 14px; height: 14px; color: var(--color-primary); opacity: 0.7; }

    @media (max-width: 600px) {
      .score-value, .streak-value { font-size: 2.5rem; }
      .day-header { gap: var(--space-md); }
    }

    .score-footer {
      margin-top: var(--space-2xl);
      padding-top: var(--space-lg);
      border-top: 1px solid rgba(255, 255, 255, 0.03);
      text-align: center;
    }
    .score-footer p {
      font-size: 0.65rem;
      color: var(--color-text-muted);
      opacity: 0.5;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.5;
      font-weight: 500;
    }
  `]
})
export class ProgressComponent implements OnInit {
  private progressService = inject(ProgressService);
  private snack = inject(MatSnackBar);

  data = signal<ProgressResponse | null>(null);
  loading = signal(true);

  ngOnInit() {
    console.log('DEBUG ProgressComponent Init - Production:', environment.production);
    console.log('DEBUG ProgressComponent Init - API URL:', environment.apiUrl);
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.progressService.getProgress(7).subscribe({
      next: (res) => {
        console.log('DEBUG Progress Data:', res);
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.snack.open('Erro ao carregar progresso.', 'OK', { duration: 5000 });
        this.loading.set(false);
      }
    });
  }

  getRankLabel(score: number): string {
    if (score >= 100) return 'Mestre do Sono';
    if (score >= 80) return 'Alta Performance';
    if (score >= 60) return 'Consistente';
    if (score >= 40) return 'Em Evolução';
    return 'Iniciante';
  }

  formatSleepMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }
}
