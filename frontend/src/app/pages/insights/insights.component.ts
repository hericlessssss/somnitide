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
      <header class="section-header">
        <h1>Insights de Sono</h1>
        <p>Entenda seus padrões e melhore sua rotina.</p>
      </header>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon color="primary">schedule</mat-icon>
            <mat-card-title>Média de Sono</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ avgHours() | number:'1.1-1' }}h</div>
            <div class="stat-unit">por noite</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon color="accent">stars</mat-icon>
            <mat-card-title>Qualidade Média</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ avgQuality() | number:'1.1-1' }}</div>
            <div class="stat-unit">estrelas</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon color="warn">hotel</mat-icon>
            <mat-card-title>Total de Noites</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ totalSessions() }}</div>
            <div class="stat-unit">sessões registradas</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Duração (Últimos 7 dias)</mat-card-title>
          </mat-card-header>
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

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Distribuição de Qualidade</mat-card-title>
          </mat-card-header>
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
      max-width: 1000px;
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
    }
    .section-header p { color: #7986cb; font-size: 1.1rem; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }
    .stat-card {
      border-radius: 20px;
      padding: 16px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .stat-card mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
    }
    .stat-card mat-card-title {
      font-size: 1rem;
      margin-top: 8px;
      color: #7986cb;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-value {
      font-size: 3rem;
      font-weight: 300;
      color: #1a237e;
    }
    .stat-unit {
      color: #999;
      font-size: 0.9rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }
    .chart-card {
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .chart-wrapper {
      height: 300px;
      margin-top: 16px;
    }

    @media (max-width: 600px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
      .chart-wrapper {
        height: 250px;
      }
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
                    backgroundColor: 'rgba(63, 81, 181, 0.2)',
                    borderColor: '#3f51b5',
                    pointBackgroundColor: '#1a237e',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(63, 81, 181, 0.8)',
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
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Horas' }
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
                        '#ef5350',
                        '#ff7043',
                        '#ffca28',
                        '#9ccc65',
                        '#66bb6a'
                    ]
                }
            ]
        };
    });

    qualityOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
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
