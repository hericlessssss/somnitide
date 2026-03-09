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
    <div class="auth-container fade-in">
      <mat-card class="auth-card">
        <mat-card-header class="auth-card-header">
          <div class="brand-container">
            <mat-icon class="brand-icon">waves</mat-icon>
            <h1 class="brand-name">SomniTide</h1>
          </div>
          <p class="brand-caption">Acorde no fim do ciclo.</p>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="loginError()" class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ loginError() }}</span>
          </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email" 
                     placeholder="seu@email.com" required email 
                     autocomplete="email">
              <mat-icon matPrefix class="secondary-icon">email</mat-icon>
            </mat-form-field>
   
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Senha</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" 
                     name="password" [(ngModel)]="password" 
                     placeholder="Sua senha" required
                     autocomplete="current-password">
              <mat-icon matPrefix class="secondary-icon">lock</mat-icon>
              <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" 
                      type="button" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword()">
                <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>
   
            <div class="privacy-callout">
              <mat-icon>info_outline</mat-icon>
              <p>Usamos suas sessões para personalizar recomendações. Sem spam.</p>
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
    </div>
  `,
  styles: `
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 8vh; /* Top bias */
      min-height: 100vh;
      width: 100%;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
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
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-caption {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-muted);
      margin: 0;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px; /* Increased from 4px to accommodate focus glow */
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
      font-size: 14px;
      font-weight: 500;
    }
    .privacy-callout {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border);
      padding: 12px var(--space-md);
      border-radius: var(--radius-md);
      margin: 8px 0; /* Tightened */
    }
    .privacy-callout mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--color-text-muted);
    }
    .privacy-callout p {
      font-size: 12px;
      color: var(--color-text-muted);
      line-height: 1.4;
      margin: 0;
    }
    .cta-button {
      width: 100%;
      height: 52px;
      border-radius: var(--radius-md);
      font-size: 16px;
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
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .auth-footer {
      padding: var(--space-xl) 0 0;
      margin-top: var(--space-xl);
      text-align: center;
    }
    .footer-text {
      font-size: 14px;
      color: var(--color-text-muted);
    }
    .footer-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      margin-left: 4px;
      padding: 4px 8px;
    }
    
    /* Material Overrides for Premium Inputs */
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    ::ng-deep .mat-mdc-form-field { margin-bottom: 4px; } /* Safety space */
    ::ng-deep .mat-mdc-form-field-wrapper { padding-bottom: 0; }
    ::ng-deep .mat-mdc-text-field-outlined {
      background-color: var(--color-surface-2) !important;
      border-radius: var(--radius-md) !important;
      transition: all var(--transition-fast) !important;
    }
    ::ng-deep .mat-mdc-form-field-focus-overlay { background: transparent !important; }
    
    /* Focused State Glow and Borders */
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-width: 2px !important; /* Subtle but clear */
      border-color: var(--color-primary) !important;
    }
    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-text-field-outlined {
      box-shadow: 0 0 0 3px var(--color-primary-glow) !important; /* Refined glow */
      border-radius: var(--radius-md) !important;
    }

    /* Fixed Label Clipping for floatLabel="always" */
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch {
      border-right: none !important;
    }
    ::ng-deep .mat-mdc-form-field .mdc-floating-label {
      color: var(--color-text-muted) !important;
      font-size: 16px !important;
    }
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-floating-label {
      color: var(--color-primary) !important;
    }

    @media (max-width: 480px) {
      .auth-card {
        max-width: 100%;
        margin: 0 var(--space-lg);
        padding: var(--space-lg);
      }
      .brand-name { font-size: 22px; }
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
