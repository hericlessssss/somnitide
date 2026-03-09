import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" class="main-toolbar">
      <span routerLink="/home" style="cursor: pointer">Somnitide</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/home">Home</button>
      <button mat-button routerLink="/history">Histórico</button>
      <button mat-button routerLink="/preferences">Preferências</button>
      <span class="user-email">{{ auth.user?.email }}</span>
      <button mat-icon-button (click)="onLogout()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <main class="has-toolbar">
      <router-outlet />
    </main>
  `,
  styles: `
    .spacer {
      flex: 1 1 auto;
    }
    .main-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    .has-toolbar {
      margin-top: 64px;
      padding: 16px;
    }
    .user-email {
      font-size: 0.9rem;
      margin: 0 16px;
      opacity: 0.8;
      font-weight: 300;
    }
  `
})
export class PrivateLayoutComponent {
  public auth = inject(AuthService);
  private router = inject(Router);

  async onLogout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
