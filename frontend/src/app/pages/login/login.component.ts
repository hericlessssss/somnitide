import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink,
    MatIconModule // Added MatIconModule
  ],
  template: `
    <mat-card class="auth-card">
      <mat-card-header class="auth-card-header">
        <div class="brand-container" aria-label="SomniTide Brand">
          <img src="logo.png" alt="SomniTide Logo" class="brand-icon">
          <h1 class="brand-name gradient-text">somnitide</h1>
        </div>
        <p class="brand-caption">Métricas do seu sono</p>
      </mat-card-header>
      
      <mat-card-content>
        <div *ngIf="loginError()" class="error-banner" role="alert" aria-live="assertive" id="login-error">
          <mat-icon aria-hidden="true">error_outline</mat-icon>
          <span>{{ loginError() }}</span>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form" [attr.aria-describedby]="loginError() ? 'login-error' : null">
          <mat-form-field appearance="outline" floatLabel="always" subscriptSizing="dynamic">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" 
                   placeholder="seu@email.com" required email 
                   autocomplete="email" [attr.aria-label]="'Endereço de e-mail'">
            <mat-icon matPrefix class="secondary-icon" aria-hidden="true">email</mat-icon>
          </mat-form-field>
  
          <mat-form-field appearance="outline" floatLabel="always" subscriptSizing="dynamic">
            <mat-label>Senha</mat-label>
            <input matInput [type]="hidePassword() ? 'password' : 'text'" 
                   name="password" [(ngModel)]="password" 
                   placeholder="Sua senha" required
                   autocomplete="current-password" [attr.aria-label]="'Senha'">
            <mat-icon matPrefix class="secondary-icon" aria-hidden="true">lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" 
                    type="button" 
                    [attr.aria-label]="hidePassword() ? 'Mostrar senha' : 'Ocultar senha'" 
                    [attr.aria-pressed]="!hidePassword()">
              <mat-icon aria-hidden="true">{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
  
          <div class="privacy-callout">
            <mat-icon>info_outline</mat-icon>
            <p>Faça login para acompanhar suas métricas e progresso. Não enviamos spam.</p>
          </div>
  
          <button mat-flat-button color="primary" class="cta-button" 
                  [disabled]="loading() || !loginForm.form.valid"
                  [attr.aria-busy]="loading()">
            <span *ngIf="!loading()">Entrar</span>
            <div *ngIf="loading()" class="loading-state">
              <mat-icon class="spin">refresh</mat-icon>
              <span>Entrando...</span>
            </div>
          </button>
        </form>
      </mat-card-content>
      
      <mat-card-footer class="auth-footer">
        <p class="footer-text">
          Não tem uma conta? 
          <a routerLink="/register" class="footer-link">Criar conta</a>
        </p>
      </mat-card-footer>
    </mat-card>
  `,
  styles: `
    .auth-card {
      width: 100%;
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      background: var(--color-surface) !important;
      border: 1px solid var(--color-border) !important;
      box-shadow: var(--shadow-2) !important;
    }
    .auth-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: var(--space-xl); /* Reduced from 2xl */
      padding: 0;
    }
    .brand-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-xs);
      width: 100%;
    }
    .brand-icon {
      width: 72px;
      height: 72px;
      object-fit: contain;
      margin-bottom: var(--space-sm);
    }
    .brand-name {
      font-size: clamp(2.42rem, 8.8vw, 3.08rem);
      font-weight: 900;
      color: var(--color-text);
      letter-spacing: -1.5px;
      margin: 0;
    }
    .brand-caption {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-muted);
      margin: 0;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Balanced gap matching RegisterComponent */
    }
    .secondary-icon {
      color: var(--color-text-muted);
      opacity: 0.7;
    }
    .error-banner {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      background: rgba(255, 92, 122, 0.1);
      border: 1px solid var(--color-danger);
      color: var(--color-danger);
      padding: var(--space-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-md); /* Reduced from xl */
      font-size: 13px;
      font-weight: 500;
    }
    .privacy-callout {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border);
      padding: 12px var(--space-md);
      border-radius: var(--radius-md);
      margin: 8px 0;
    }
    .privacy-callout mat-icon {
      font-size: 20px;
      width: 24px;
      height: 24px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      flex-shrink: 0;
    }
    .privacy-callout p {
      font-size: 11px;
      color: var(--color-text-muted);
      line-height: 1.4;
      margin: 0;
    }
    .cta-button {
      width: 100%;
      height: 52px;
      border-radius: var(--radius-md);
      font-size: 15px;
      font-weight: 600;
      margin-top: 8px; /* Reduced */
      transition: all var(--transition-fast);
    }
    .cta-button:not(:disabled):active {
      transform: scale(0.98);
    }
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
    }
    .spin {
      animation: rotate 1s linear infinite;
      font-size: 19px;
      width: 20px;
      height: 20px;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .auth-footer {
      padding: var(--space-lg) 0 0;
      margin-top: var(--space-lg);
      text-align: center;
    }
    .footer-text {
      font-size: 13px;
      color: var(--color-text-muted);
    }
    .footer-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      margin-left: 4px;
      padding: 4px 8px;
    }
    
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-floating-label {
      color: var(--color-primary) !important;
    }

    @media (max-width: 480px) {
      .auth-card {
        max-width: 100%;
        padding: var(--space-lg);
      }
      .brand-name { font-size: 21px; }
    }
  `


})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = signal(true);
  loading = signal(false);
  loginError = signal<string | null>(null);

  private auth = inject(AuthService);
  private router = inject(Router);

  async onLogin() {
    this.loginError.set(null);
    this.loading.set(true);

    try {
      const { error } = await this.auth.signInWithPassword(this.email, this.password);
      if (error) {
        this.loginError.set(this.getErrorMessage(error));
      } else {
        this.router.navigate(['/home']);
      }
    } catch (err) {
      this.loginError.set('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 400 || error.message?.includes('Invalid login credentials')) {
      return 'E-mail ou senha incorretos.';
    }
    return error.message || 'Falha ao entrar. Verifique sua conexão.';
  }

  constructor() {
    if (this.auth.isAuthenticated) {
      this.router.navigate(['/home']);
    }
  }
}
