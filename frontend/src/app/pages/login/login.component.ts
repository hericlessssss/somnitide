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
        <div class="brand-container" aria-label="somnitide Brand">
          <img src="logo.png" alt="somnitide Logo" class="brand-icon">
          <h1 class="brand-name gradient-text">somnitide</h1>
        </div>
      </mat-card-header>
      
      <mat-card-content>
        <div *ngIf="loginError()" class="error-banner" role="alert" aria-live="assertive" id="login-error">
          <mat-icon aria-hidden="true">error_outline</mat-icon>
          <span>{{ loginError() }}</span>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form" [attr.aria-describedby]="loginError() ? 'login-error' : null">
          <mat-form-field appearance="outline" floatLabel="always" subscriptSizing="dynamic" [hideRequiredMarker]="true">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" 
                   placeholder="seu@email.com" required email 
                   autocomplete="email" [attr.aria-label]="'Endereço de e-mail'">
            <mat-icon matPrefix class="secondary-icon" aria-hidden="true">email</mat-icon>
          </mat-form-field>
  
          <mat-form-field appearance="outline" floatLabel="always" subscriptSizing="dynamic" [hideRequiredMarker]="true">
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
        <p class="footer-text">Não tem uma conta? <a routerLink="/register" class="footer-link">Crie uma!</a></p>

        <div class="developer-footer">
          <span class="powered-by">produced by hericles sousa</span>
          <div class="social-links">
            <a href="https://github.com/hericlessssss/somnitide" target="_blank" aria-label="GitHub">
              <svg viewBox="0 0 24 24" class="social-icon"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/hericlesfrancisco/" target="_blank" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" class="social-icon"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </mat-card-footer>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: var(--space-xl);
      border-radius: calc(var(--radius-lg) + 4px);
      background: rgba(17, 24, 38, 0.8) !important;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5) !important;
      z-index: 2;
    }
    .auth-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: var(--space-2xl); /* More breathing room */
      padding: 0;
    }
    .brand-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs);
      margin-bottom: var(--space-xs);
      width: 100%;
    }
    .brand-icon {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin-bottom: var(--space-xs);
    }
    .brand-name {
      font-size: clamp(2.42rem, 8.8vw, 3.08rem);
      font-weight: 900;
      color: var(--color-text);
      letter-spacing: -1.5px;
      margin: 0;
      line-height: 1;
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
      padding: var(--space-xl) 0 0;
      margin-top: 32px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .footer-text {
      font-size: 13px;
      color: var(--color-text-muted);
    }
    .footer-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      margin-left: 0;
      padding: 4px 0;
    }
    
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-floating-label {
      color: var(--color-primary) !important;
    }

    /* Developer Footer */
    .developer-footer {
      margin-top: var(--space-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      opacity: 0.4;
      transition: opacity var(--transition-normal);
    }
    .developer-footer:hover {
      opacity: 0.8;
    }
    .powered-by {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--color-text-muted);
      font-weight: 500;
    }
    .social-links {
      display: flex;
      gap: var(--space-lg);
    }
    .social-icon {
      width: 18px;
      height: 18px;
      fill: var(--color-text-muted);
      transition: all var(--transition-fast);
      cursor: pointer;
    }
    .social-icon:hover {
      fill: var(--color-primary);
      transform: translateY(-2px);
    }

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
