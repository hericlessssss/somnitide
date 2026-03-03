import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
        MatSnackBarModule
    ],
    template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Somnitide</mat-card-title>
          <mat-card-subtitle>Seu assistente de sono</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Digite seu e-mail para receber um link de acesso (Magic Link).</p>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" [(ngModel)]="email" placeholder="exemplo@email.com" required>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-flat-button color="primary" [disabled]="loading()" (click)="onLogin()">
            {{ loading() ? 'Enviando...' : 'Entrar' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
    styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 16px;
      border-radius: 12px;
    }
    .full-width {
      width: 100%;
      margin-top: 16px;
    }
    mat-card-title {
      font-size: 2rem;
      font-weight: bold;
      color: #3f51b5;
    }
  `
})
export class LoginComponent {
    email = '';
    loading = signal(false);
    private auth = inject(AuthService);
    private snack = inject(MatSnackBar);
    private router = inject(Router);

    async onLogin() {
        if (!this.email) {
            this.snack.open('Por favor, informe seu e-mail.', 'Fechar', { duration: 3000 });
            return;
        }

        this.loading.set(true);
        const { error } = await this.auth.signIn(this.email);
        this.loading.set(false);

        if (error) {
            this.snack.open(`Erro: ${error.message}`, 'Fechar', { duration: 5000 });
        } else {
            this.snack.open('Link enviado! Verifique seu e-mail.', 'OK', { duration: 5000 });
        }
    }

    constructor() {
        // If user is already logged in, go home
        if (this.auth.isAuthenticated) {
            this.router.navigate(['/']);
        }
    }
}
