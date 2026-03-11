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
  selector: 'app-register',
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
    MatIconModule
  ],
  template: `
    <mat-card class="auth-card">
      <mat-card-header class="auth-card-header">
        <div class="brand-container" aria-label="SomniTide Brand">
          <mat-icon class="brand-icon" aria-hidden="true">waves</mat-icon>
          <h1 class="brand-name">SomniTide</h1>
        </div>
        <p class="brand-caption">Acorde no fim do ciclo.</p>
      </mat-card-header>
      
      <mat-card-content>
        <div *ngIf="registerError()" class="error-banner" role="alert" aria-live="assertive" id="register-error">
          <mat-icon aria-hidden="true">error_outline</mat-icon>
          <span>{{ registerError() }}</span>
        </div>

        <form (ngSubmit)="onRegister()" #registerForm="ngForm" class="auth-form" [attr.aria-describedby]="registerError() ? 'register-error' : null">
          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" 
                   placeholder="seu@email.com" required email 
                   autocomplete="email" [attr.aria-label]="'Endereço de e-mail'">
            <mat-icon matPrefix class="secondary-icon" aria-hidden="true">email</mat-icon>
          </mat-form-field>
  
          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>Senha</mat-label>
            <input matInput [type]="hidePassword() ? 'password' : 'text'" 
                   name="password" [(ngModel)]="password" 
                   placeholder="Sua senha" required minlength="6"
                   autocomplete="new-password" [attr.aria-label]="'Nova senha'">
            <mat-icon matPrefix class="secondary-icon" aria-hidden="true">lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" 
                    type="button" 
                    [attr.aria-label]="hidePassword() ? 'Mostrar senha' : 'Ocultar senha'" 
                    [attr.aria-pressed]="!hidePassword()">
              <mat-icon aria-hidden="true">{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
  
          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>Confirmar Senha</mat-label>
            <input matInput [type]="hideConfirmPassword() ? 'password' : 'text'" 
                   name="confirmPassword" [(ngModel)]="confirmPassword" 
                   placeholder="Repita a senha" required
                   autocomplete="new-password" [attr.aria-label]="'Confirmar senha'">
            <mat-icon matPrefix class="secondary-icon" aria-hidden="true">lock_reset</mat-icon>
            <button mat-icon-button matSuffix (click)="hideConfirmPassword.set(!hideConfirmPassword())" 
                    type="button" 
                    [attr.aria-label]="hideConfirmPassword() ? 'Mostrar confirmação de senha' : 'Ocultar confirmação de senha'" 
                    [attr.aria-pressed]="!hideConfirmPassword()">
              <mat-icon aria-hidden="true">{{hideConfirmPassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
  
          <div class="privacy-callout">
            <mat-icon>info_outline</mat-icon>
            <p>Sua privacidade é nossa prioridade. Não enviamos e-mails desnecessários.</p>
          </div>
  
          <button mat-flat-button color="primary" class="cta-button" 
                  [disabled]="loading() || !registerForm.form.valid"
                  [attr.aria-busy]="loading()">
            <span *ngIf="!loading()">Criar Conta</span>
            <div *ngIf="loading()" class="loading-state">
              <mat-icon class="spin">refresh</mat-icon>
              <span>Criando conta...</span>
            </div>
          </button>
        </form>
      </mat-card-content>
      
      <mat-card-footer class="auth-footer">
        <p class="footer-text">
          Já tem uma conta? 
          <a routerLink="/login" class="footer-link">Fazer Login</a>
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
      margin-bottom: var(--space-xl);
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
      font-size: 27px;
      width: 28px;
      height: 28px;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name {
      font-size: 23px;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.5px;
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
      gap: 16px; /* Optimized gap for 3 fields */
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
      margin-bottom: var(--space-md);
      font-size: 13px;
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
      margin: 4px 0;
    }
    .privacy-callout mat-icon {
      font-size: 19px;
      width: 20px;
      height: 20px;
      color: var(--color-text-muted);
    }
    .privacy-callout p {
      font-size: 10px;
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
      margin-top: 8px;
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
      margin-top: var(--space-xl);
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
    }
  `



})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  loading = signal(false);
  registerError = signal<string | null>(null);

  private auth = inject(AuthService);
  private router = inject(Router);

  async onRegister() {
    this.registerError.set(null);

    if (this.password !== this.confirmPassword) {
      this.registerError.set('As senhas não conferem.');
      return;
    }

    if (this.password.length < 6) {
      this.registerError.set('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.loading.set(true);

    try {
      const { data, error } = await this.auth.signUp(this.email, this.password);

      if (error) {
        this.registerError.set(this.getErrorMessage(error));
      } else if (data.session) {
        this.router.navigate(['/home']);
      } else {
        // Explicit success feedback for email confirmation flow
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      }
    } catch (err) {
      this.registerError.set('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 400 || error.message?.includes('User already registered')) {
      return 'Este e-mail já está cadastrado.';
    }
    return error.message || 'Falha ao criar conta. Verifique sua conexão.';
  }
}
