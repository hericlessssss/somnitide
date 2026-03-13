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
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { PageContainerComponent } from '../../shared/page-container/page-container.component';

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
    MatSnackBarModule,
    PageHeaderComponent,
    PageContainerComponent
  ],
  template: `
    <app-page-container>
      <app-page-header
        title="Configurações de Perfil"
        subtitle="Gerencie sua identidade no SomniTide" />

      <mat-card class="profile-card">
        <mat-card-content>
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img [src]="getAvatar(profile()?.avatarSeed || auth.user?.id || '')" 
                   alt="Avatar" [class]="getRankClass(profile()?.rankPosition)">
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

              <div class="stat-card rank-status-card" [class]="getRankClass(profile()?.rankPosition)">
                <span class="sub-section-title">Status SomniTide</span>
                <div class="status-row">
                  <mat-icon>{{ getRankIcon(profile()?.rankPosition) }}</mat-icon>
                  <span class="stat-value">{{ getRankTitle(profile()?.rankPosition) }}</span>
                </div>
                <span class="stat-hint" *ngIf="profile()?.rankPosition">Posição #{{ profile()?.rankPosition }} no Ranking Global</span>
                <span class="stat-hint" *ngIf="!profile()?.rankPosition">Dê o seu melhor para entrar no Top 100!</span>
                <span class="member-since" *ngIf="profile()?.createdAtUtc">membro desde {{ profile()?.createdAtUtc | date:'MMMM yyyy' }}</span>
              </div>

              <div class="stat-card score-card">
                <span class="sub-section-title">Pontuação Global</span>
                <span class="stat-value text-primary large">{{ profile()?.totalScore || 0 }} pts</span>
                <span class="stat-hint">Soma de toda a sua jornada</span>
              </div>
              
              <div class="stat-card id-card clickable" (click)="copyId()">
                <div class="id-wrapper">
                  <span class="sub-section-title">ID de Usuário</span>
                  <div class="id-value-row">
                    <span class="stat-value truncate-id">{{ auth.user?.id }}</span>
                    <mat-icon class="copy-icon">content_copy</mat-icon>
                  </div>
                </div>
                <mat-hint class="copy-hint">Toque para copiar o ID</mat-hint>
              </div>

            <button mat-flat-button color="primary" class="save-btn clickable" 
                    [disabled]="loading() || !profileForm.valid">
              <mat-icon *ngIf="!loading()">save</mat-icon>
              {{ loading() ? 'Salvando...' : 'Salvar Perfil' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </app-page-container>
  `,
  styles: [`
    /* Container + header handled by PageContainer / PageHeader */
    .profile-container {
      /* Card content centering within 860px container */
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      max-width: 500px;
      margin: 0 auto;
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
      border: 4px solid var(--color-border);
      padding: 4px;
      transition: all var(--transition-md);
      object-fit: cover;
    }
    .avatar-wrapper img.rank-supreme { 
      border-color: #ffd700; 
      box-shadow: 0 0 25px rgba(255, 215, 0, 0.4);
      animation: gold-glow-avatar 3s infinite alternate;
    }
    .avatar-wrapper img.rank-master { border-color: #c0c0c0; box-shadow: 0 0 15px rgba(192, 192, 192, 0.3); }
    .avatar-wrapper img.rank-guardian { border-color: #cd7f32; box-shadow: 0 0 12px rgba(205, 127, 50, 0.3); }
    .avatar-wrapper img.rank-legend { border-color: var(--color-primary); box-shadow: 0 0 10px rgba(99, 102, 241, 0.3); }
    .avatar-wrapper img.rank-elite { border-color: #42d6c6; }

    @keyframes gold-glow-avatar {
      from { box-shadow: 0 0 10px rgba(255, 215, 0, 0.2), inset 0 0 5px rgba(255, 215, 0, 0.1); }
      to { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.2); }
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
    .stat-value { 
      font-size: 16px; 
      font-weight: 900; 
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
    .member-since {
      font-size: 10px;
      color: var(--color-text-muted);
      opacity: 0.5;
      margin-top: 2px;
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

    .status-row {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin: 4px 0;
    }
    .rank-status-card { border-width: 2px !important; }
    .rank-supreme { border-color: #ffd700 !important; background: rgba(255, 215, 0, 0.05); color: #ffd700 !important; }
    .rank-master { border-color: #c0c0c0 !important; background: rgba(192, 192, 192, 0.05); color: #c0c0c0 !important; }
    .rank-guardian { border-color: #cd7f32 !important; background: rgba(205, 127, 50, 0.05); color: #cd7f32 !important; }
    .rank-legend { border-color: var(--color-primary) !important; color: var(--color-primary) !important; }
    .rank-elite { border-color: #42d6c6 !important; color: #42d6c6 !important; }
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

  getRankTitle(pos?: number): string {
    if (!pos) return 'Membro SomniTide';
    if (pos === 1) return 'Mestre Supremo do Sono';
    if (pos === 2) return 'Mestre do Sono';
    if (pos === 3) return 'Guardião do Descanso';
    if (pos <= 10) return 'Lendário do Sono';
    if (pos <= 100) return 'Elite do Sono';
    return 'Membro SomniTide';
  }

  getRankClass(pos?: number): string {
    if (!pos) return '';
    if (pos === 1) return 'rank-supreme';
    if (pos === 2) return 'rank-master';
    if (pos === 3) return 'rank-guardian';
    if (pos <= 10) return 'rank-legend';
    if (pos <= 100) return 'rank-elite';
    return '';
  }

  getRankIcon(pos?: number): string {
    if (!pos) return 'person';
    if (pos === 1) return 'workspace_premium';
    if (pos === 2) return 'military_tech';
    if (pos === 3) return 'verified';
    if (pos <= 10) return 'stars';
    if (pos <= 100) return 'emoji_events';
    return 'person';
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
