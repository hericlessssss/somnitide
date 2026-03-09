import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { SleepService, SessionResponse } from '../../services/sleep.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  template: `
    <div class="insights-container">
      <header class="section-header fade-in">
        <h1>Seu Desempenho</h1>
        <p>A ciência por trás do seu descanso.</p>
      </header>

      <div class="stats-grid">
        <mat-card class="stat-card fade-in">
          <div class="stat-icon-bg primary">
            <mat-icon>schedule</mat-icon>
          </div>
          <mat-card-content>
            <div class="stat-label">Média de Sono</div>
            <div class="stat-value-group">
              <span class="stat-value">{{ avgHours() | number:'1.1-1' }}</span>
              <span class="stat-unit">horas</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card fade-in">
          <div class="stat-icon-bg accent">
            <mat-icon>stars</mat-icon>
          </div>
          <mat-card-content>
            <div class="stat-label">Qualidade Média</div>
            <div class="stat-value-group">
              <span class="stat-value">{{ avgQuality() | number:'1.1-1' }}</span>
              <span class="stat-unit">rating</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card fade-in">
          <div class="stat-icon-bg warn">
            <mat-icon>hotel</mat-icon>
          </div>
          <mat-card-content>
            <div class="stat-label">Total de Noites</div>
            <div class="stat-value-group">
              <span class="stat-value">{{ totalSessions() }}</span>
              <span class="stat-unit">sessões</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card fade-in">
          <header class="chart-header">
            <h3>Duração do Sono</h3>
            <span>Últimos 7 dias</span>
          </header>
          <mat-card-content>
            <div class="chart-wrapper">
              <canvas baseChart
                [data]="durationData()"
                [options]="durationOptions"
                [type]="'line'">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card fade-in">
          <header class="chart-header">
            <h3>Níveis de Qualidade</h3>
            <span>Frequência por estrela</span>
          </header>
          <mat-card-content>
            <div class="chart-wrapper">
              <canvas baseChart
                [data]="qualityData()"
                [options]="qualityOptions"
                [type]="'bar'">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .insights-container {
      max-width: 1100px;
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }
    .stat-card {
      position: relative;
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      background: rgba(17, 24, 38, 0.4) !important;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid var(--color-border) !important;
      transition: all var(--transition-normal);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      overflow: hidden;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      background: rgba(17, 24, 38, 0.6) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }

    .stat-icon-bg {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-md);
      font-size: 28px;
    }
    .stat-icon-bg mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-icon-bg.primary { background: rgba(66, 214, 198, 0.1); color: var(--color-primary); }
    .stat-icon-bg.accent { background: rgba(255, 200, 87, 0.1); color: var(--color-warning); }
    .stat-icon-bg.warn { background: rgba(255, 92, 122, 0.1); color: var(--color-danger); }

    .stat-label {
      font-family: var(--font-title);
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      margin-bottom: var(--space-xs);
    }
    .stat-value-group { display: flex; align-items: baseline; justify-content: center; gap: 4px; }
    .stat-value {
      font-size: 3rem;
      font-weight: 800;
      color: var(--color-text);
      font-family: var(--font-title);
      line-height: 1;
    }
    .stat-unit {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: var(--space-lg);
    }
    .chart-card {
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      background: rgba(17, 24, 38, 0.3) !important;
      border: 1px solid var(--color-border) !important;
    }
    .chart-header {
      margin-bottom: var(--space-lg);
    }
    .chart-header h3 {
      font-family: var(--font-title);
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-text);
    }
    .chart-header span {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 500;
    }
    .chart-wrapper {
      height: 300px;
      margin-top: var(--space-sm);
    }

    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
      .stat-value { font-size: 2.5rem; }
      .chart-card { padding: var(--space-md); }
    }
  `]

})
export class InsightsComponent implements OnInit {
  private sleepService = inject(SleepService);

  history = signal<SessionResponse[]>([]);
  totalSessions = computed(() => this.history().length);

  avgHours = computed(() => {
    const list = this.history();
    if (list.length === 0) return 0;
    const total = list.reduce((acc, s) => acc + this.calculateDuration(s), 0);
    return total / list.length;
  });

  avgQuality = computed(() => {
    const list = this.history().filter(s => s.qualityRating !== null);
    if (list.length === 0) return 0;
    const total = list.reduce((acc, s) => acc + (s.qualityRating || 0), 0);
    return total / list.length;
  });

  durationData = computed<ChartData<'line'>>(() => {
    const last7 = [...this.history()].reverse().slice(-7);
    return {
      labels: last7.map(s => {
        const d = new Date(s.startedAtUtc);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: last7.map(s => this.calculateDuration(s)),
          label: 'Horas de Sono',
          backgroundColor: 'rgba(66, 214, 198, 0.1)',
          borderColor: '#42D6C6',
          pointBackgroundColor: '#42D6C6',
          pointBorderColor: '#0B0F14',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#42D6C6',
          fill: 'origin',
          tension: 0.4
        }
      ]
    };
  });

  durationOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', weight: 500 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans' } }
      }
    }
  };

  qualityData = computed<ChartData<'bar'>>(() => {
    const counts = [0, 0, 0, 0, 0];
    this.history().forEach(s => {
      if (s.qualityRating) {
        counts[s.qualityRating - 1]++;
      }
    });
    return {
      labels: ['1 ⭐', '2 ⭐', '3 ⭐', '4 ⭐', '5 ⭐'],
      datasets: [
        {
          data: counts,
          label: 'Frequência',
          backgroundColor: [
            '#FF5C7A', // Ruby Red
            '#FF9F43', // Orange
            '#FFC857', // Gold
            '#3DE19A', // Green
            '#42D6C6'  // Teal
          ],
          borderRadius: 8
        }
      ]
    };
  });

  qualityOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', weight: 600 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#64748b', stepSize: 1 }
      }
    }
  };

  ngOnInit() {
    this.sleepService.getHistory(50).subscribe(res => {
      this.history.set(res.history.filter(s => s.endedAtUtc !== null));
    });
  }

  private calculateDuration(session: SessionResponse): number {
    if (!session.endedAtUtc) return 0;
    const diff = new Date(session.endedAtUtc).getTime() - new Date(session.startedAtUtc).getTime();
    return diff / (1000 * 60 * 60);
  }
}
