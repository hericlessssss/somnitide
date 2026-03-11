import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container fade-in">
      <header class="profile-header">
        <h1 class="gradient-text">Configurações de Perfil</h1>
        <p class="subtitle">Gerencie sua identidade no SomniTide</p>
      </header>

      <mat-card class="profile-card">
        <mat-card-content>
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img [src]="getAvatar(profile()?.avatarSeed || auth.user?.id || '')" alt="Avatar">
            </div>
            <p class="avatar-hint">Seu avatar é gerado automaticamente baseado no seu ID.</p>
          </div>

          <form (ngSubmit)="onUpdate()" #profileForm="ngForm" class="profile-form">
            <mat-form-field appearance="outline" floatLabel="always" class="handle-field">
              <mat-label>Nome de exibição (@)</mat-label>
              <input matInput type="text" name="handle" [(ngModel)]="handle" 
                     placeholder="ex: mestre_do_sono" required minlength="3">
              <mat-icon matPrefix>alternate_email</mat-icon>
              <mat-hint>Este é o seu nome único no Ranking Global.</mat-hint>
            </mat-form-field>

            <div class="stats-container">
              <div class="stat-card score-card">
                <span class="stat-label">Pontuação Global</span>
                <span class="stat-value text-primary large">{{ profile()?.totalScore || 0 }} pts</span>
                <span class="stat-hint">Soma de toda a sua jornada</span>
              </div>
              
              <div class="stat-card id-card clickable" (click)="copyId()">
                <div class="id-wrapper">
                  <span class="stat-label">ID de Usuário</span>
                  <div class="id-value-row">
                    <span class="stat-value truncate-id">{{ auth.user?.id }}</span>
                    <mat-icon class="copy-icon">content_copy</mat-icon>
                  </div>
                </div>
                <mat-hint class="copy-hint">Toque para copiar o ID</mat-hint>
              </div>
            </div>

            <button mat-flat-button color="primary" class="save-btn clickable" 
                    [disabled]="loading() || !profileForm.valid">
              <mat-icon *ngIf="!loading()">save</mat-icon>
              {{ loading() ? 'Salvando...' : 'Salvar Perfil' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: var(--space-xl);
      max-width: 500px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .profile-header {
      text-align: center;
      margin-bottom: var(--space-md);
    }
    .gradient-text {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
      margin: 0;
    }
    .subtitle {
      color: var(--color-text-muted);
      font-size: 15px;
      margin-top: var(--space-xs);
    }
    .profile-card {
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
    }
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: var(--space-2xl);
    }
    .avatar-wrapper {
      position: relative;
      margin-bottom: var(--space-md);
    }
    .avatar-wrapper img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 3px solid var(--color-primary);
      padding: 4px;
      box-shadow: 0 0 20px var(--color-primary-glow);
    }
    .avatar-hint {
      font-size: 12px;
      color: var(--color-text-muted);
      max-width: 250px;
      text-align: center;
      margin: 0;
    }
    .profile-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .handle-field {
      width: 100%;
    }
    .stats-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .stat-card {
      background: rgba(255,255,255,0.02);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px solid var(--color-border);
      transition: all 0.2s ease;
    }
    .score-card {
      align-items: center;
      background: linear-gradient(to right, rgba(66, 214, 198, 0.05), transparent);
    }
    .id-card {
      cursor: pointer;
    }
    .id-card:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.2);
    }
    .id-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .id-value-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
    }
    .stat-label { 
      font-size: 11px; 
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .stat-value { 
      font-size: 16px; 
      font-weight: 700; 
      color: var(--color-text); 
    }
    .stat-value.large {
      font-size: 24px;
    }
    .stat-hint {
      font-size: 10px;
      color: var(--color-text-muted);
      opacity: 0.7;
      margin-top: 4px;
      display: block;
    }
    .truncate-id { 
      overflow: hidden; 
      text-overflow: ellipsis; 
      white-space: nowrap;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--color-text-muted);
      flex: 1;
    }
    .copy-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--color-primary);
      opacity: 0.6;
    }
    .copy-hint {
      font-size: 10px;
      color: var(--color-primary);
      opacity: 0.5;
      text-align: right;
    }
    .save-btn {
      height: 52px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: var(--space-md);
    }
    .text-primary { color: var(--color-primary) !important; }
  `]
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  public auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  profile = signal<UserProfile | null>(null);
  handle = '';
  loading = signal(false);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (p) => {
        if (p) {
          this.profile.set(p);
          this.handle = p.handle || '';
        }
      },
      error: () => {
        // Expected if user has no profile yet
      }
    });
  }

  onUpdate() {
    this.loading.set(true);
    this.profileService.updateProfile(this.handle).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.handle = p.handle;
        this.loading.set(false);
        this.snackBar.open('Perfil atualizado com sucesso!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Erro ao atualizar perfil.', 'OK', { duration: 5000 });
      }
    });
  }

  getAvatar(seed: string): string {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
  }

  copyId() {
    const id = this.auth.user?.id;
    if (id) {
      navigator.clipboard.writeText(id).then(() => {
        this.snackBar.open('ID copiado para a área de transferência!', 'OK', {
          duration: 3000,
          panelClass: ['premium-snackbar']
        });
      });
    }
  }
}
