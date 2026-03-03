import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SleepService, SessionResponse } from '../../services/sleep.service';
import { AuthService } from '../../services/auth.service';

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
      <header class="top-bar">
        <h1>Somnitide</h1>
        <div class="user-menu">
          <span>{{ auth.user?.email }}</span>
          <button mat-icon-button (click)="auth.signOut()">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </header>

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
              <p>Você está dormindo (ou simulando dormir).</p>
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
            <mat-card *ngFor="let s of activeSession()?.suggestions" class="suggestion-card" [class.recommended]="s.isRecommended">
              <mat-card-header>
                <mat-card-title>{{ s.wakeTimeUtc | date:'HH:mm' }}</mat-card-title>
                <mat-card-subtitle>{{ s.cycles }} ciclos</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p *ngIf="s.isRecommended"><strong>RECOMENDADO</strong></p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </main>
    </div>
  `,
    styles: `
    .home-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      background-color: #3f51b5;
      color: white;
      height: 64px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .top-bar h1 { margin: 0; font-weight: 300; }
    .user-menu { display: flex; align-items: center; gap: 12px; }

    .content {
      max-width: 800px;
      margin: 32px auto;
      padding: 0 16px;
    }

    .hero-card {
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 32px;
    }
    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 0;
    }
    .current-time {
      text-align: center;
      margin-bottom: 24px;
    }
    .current-time .label { display: block; font-size: 0.9rem; color: #666; text-transform: uppercase; }
    .current-time .time { font-size: 4rem; font-weight: 200; color: #3f51b5; }

    .suggestions-section h3 {
      font-weight: 400;
      color: #555;
      margin-bottom: 16px;
    }
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }
    .suggestion-card { border-radius: 12px; }
    .suggestion-card.recommended {
      background-color: #e8eaf6;
      border: 2px solid #3f51b5;
    }
    .actions-center {
      display: flex;
      justify-content: center;
      padding-bottom: 16px;
    }
  `
})
export class HomeComponent {
    auth = inject(AuthService);
    private sleepService = inject(SleepService);
    private snack = inject(MatSnackBar);

    currentTime = signal(new Date());
    activeSession = signal<SessionResponse | null>(null);
    loading = signal(false);

    constructor() {
        setInterval(() => this.currentTime.set(new Date()), 1000);
        this.refreshStatus();
    }

    refreshStatus() {
        this.sleepService.getHistory(0).subscribe({
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
        // For simplicity, we assume 4 stars and no note for now. 
        // In a real app we'd show a dialog.
        this.loading.set(true);
        this.sleepService.endSession(4, 'Acordei via web app').subscribe({
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
    }
}
