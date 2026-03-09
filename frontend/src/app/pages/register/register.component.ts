import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
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
    RouterLink
  ],
  template: `
    <mat-card class="auth-card">
      <mat-card-header>
        <mat-card-title>Criar Conta</mat-card-title>
        <mat-card-subtitle>Comece a melhorar suas noites agora</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="onRegister()" #registerForm="ngForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" placeholder="exemplo@email.com" required email>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha</mat-label>
            <input matInput type="password" name="password" [(ngModel)]="password" required minlength="6">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmar Senha</mat-label>
            <input matInput type="password" name="confirmPassword" [(ngModel)]="confirmPassword" required>
          </mat-form-field>

          <div class="auth-note">
            <p>Armazenamos suas sessões para personalizar e melhorar suas recomendações de sono. Não é necessário confirmar e-mail.</p>
          </div>

          <button mat-flat-button color="primary" class="full-width" [disabled]="loading() || !registerForm.form.valid">
            {{ loading() ? 'Criando conta...' : 'Criar Conta' }}
          </button>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <a routerLink="/login" class="auth-link">Já tenho uma conta</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 16px;
      border-radius: 12px;
    }
    .full-width {
      width: 100%;
      margin-top: 8px;
    }
    .auth-note {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 16px 0;
      line-height: 1.4;
    }
    .auth-link {
      color: #3f51b5;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .auth-link:hover {
      text-decoration: underline;
    }
    mat-card-title {
      font-size: 1.8rem;
      font-weight: bold;
      color: #3f51b5;
    }
  `
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);

  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  async onRegister() {
    if (this.password !== this.confirmPassword) {
      this.snack.open('As senhas não conferem.', 'Fechar', { duration: 3000 });
      return;
    }

    this.loading.set(true);
    const { data, error } = await this.auth.signUp(this.email, this.password);
    this.loading.set(false);

    if (error) {
      this.snack.open(`Erro: ${error.message}`, 'Fechar', { duration: 5000 });
    } else if (data.session) {
      this.snack.open('Conta criada e logada com sucesso!', 'OK', { duration: 5000 });
      this.router.navigate(['/home']);
    } else {
      this.snack.open('Conta criada! Verifique seu e-mail para confirmar (ou peça ao admin para desativar a confirmação).', 'OK', { duration: 10000 });
      this.router.navigate(['/login']);
    }
  }
}
