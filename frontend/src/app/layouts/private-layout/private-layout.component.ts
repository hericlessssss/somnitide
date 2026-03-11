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
    <header class="app-header">
      <mat-toolbar class="main-toolbar" role="banner">
        <div class="toolbar-content">
          <div class="brand clickable" routerLink="/home" aria-label="SomniTide Home">
            <mat-icon class="brand-icon" aria-hidden="true">waves</mat-icon>
            <span class="brand-name">SomniTide</span>
          </div>
          
          <nav class="desktop-nav" aria-label="Navegação principal">
            <a routerLink="/home" routerLinkActive="active-link" class="nav-item">Home</a>
            <a routerLink="/history" routerLinkActive="active-link" class="nav-item">Histórico</a>
            <a routerLink="/insights" routerLinkActive="active-link" class="nav-item">Insights</a>
            <a routerLink="/progress" routerLinkActive="active-link" class="nav-item">Progresso</a>
            <a routerLink="/ranking" routerLinkActive="active-link" class="nav-item">Ranking</a>
          </nav>

          <span class="spacer"></span>

          <div class="user-section">
            <button mat-icon-button routerLink="/profile" aria-label="Meu Perfil" title="Perfil" class="profile-btn">
              <mat-icon aria-hidden="true">account_circle</mat-icon>
            </button>
            <span class="user-email desktop-only">{{ auth.user?.email }}</span>
            <button mat-icon-button (click)="onLogout()" aria-label="Sair da conta" title="Sair" class="logout-btn">
              <mat-icon aria-hidden="true">logout</mat-icon>
            </button>
          </div>
        </div>
      </mat-toolbar>
    </header>

    <main class="main-content fade-in">
      <div class="content-container">
        <router-outlet />
      </div>
    </main>

    <nav class="mobile-nav-container fade-in" aria-label="Navegação inferior">
      <div class="mobile-nav-bar">
        <a routerLink="/home" routerLinkActive="active" class="mobile-nav-item" aria-label="Ir para Home">
          <mat-icon aria-hidden="true">home</mat-icon>
          <span>Home</span>
        </a>
        <a routerLink="/history" routerLinkActive="active" class="mobile-nav-item" aria-label="Ir para Histórico">
          <mat-icon aria-hidden="true">history</mat-icon>
          <span>Histórico</span>
        </a>
        <a routerLink="/insights" routerLinkActive="active" class="mobile-nav-item" aria-label="Ir para Insights">
          <mat-icon aria-hidden="true">insights</mat-icon>
          <span>Insights</span>
        </a>
        <a routerLink="/progress" routerLinkActive="active" class="mobile-nav-item" aria-label="Ir para Progresso">
          <mat-icon aria-hidden="true">trending_up</mat-icon>
          <span>Progresso</span>
        </a>
        <a routerLink="/ranking" routerLinkActive="active" class="mobile-nav-item" aria-label="Ir para Ranking">
          <mat-icon aria-hidden="true">emoji_events</mat-icon>
          <span>Ranking</span>
        </a>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--color-bg);
    }

    .app-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      /* Glassmorphism Effect */
      background: rgba(11, 15, 20, 0.7) !important;
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border-bottom: 1px solid var(--color-border);
    }

    .main-toolbar {
      background: transparent !important;
      height: 72px;
      padding: 0 var(--space-xl);
      color: var(--color-text) !important;
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Brand Consistency (matching Auth screens) */
    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
      transition: opacity var(--transition-fast);
    }
    .brand:hover { opacity: 0.8; }

    .brand-icon {
      color: var(--color-primary);
      font-size: 24px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: var(--color-text);
      font-family: var(--font-title);
    }

    /* Desktop Nav Refinement */
    .desktop-nav {
      margin-left: var(--space-2xl);
      display: none;
      gap: var(--space-md);
    }

    @media (min-width: 768px) {
      .desktop-nav { display: flex; }
    }

    .nav-item {
      text-decoration: none;
      color: var(--color-text-muted);
      font-size: 14px;
      font-weight: 500;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .nav-item:hover {
      color: var(--color-text);
      background: rgba(255, 255, 255, 0.04);
    }

    .active-link {
      color: var(--color-primary) !important;
      background: rgba(66, 214, 198, 0.08) !important;
      font-weight: 600;
    }

    .spacer { flex: 1; }

    /* User Section */
    .user-section {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .user-email {
      font-size: 13px;
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .logout-btn {
      color: var(--color-text-muted) !important;
      transition: all var(--transition-fast);
    }
    .logout-btn:hover {
      color: var(--color-danger) !important;
      background: rgba(255, 92, 122, 0.1) !important;
    }

    .profile-btn {
      color: var(--color-text-muted) !important;
      transition: all var(--transition-fast);
    }
    .profile-btn:hover {
      color: var(--color-primary) !important;
      background: rgba(66, 214, 198, 0.1) !important;
    }

    .desktop-only { display: none; }
    @media (min-width: 768px) {
      .desktop-only { display: block; }
    }

    /* Content Layout */
    .main-content {
      flex: 1;
      margin-top: 72px;
      padding: var(--space-lg);
      /* Dynamic padding-bottom: Nav height + safe area + margin */
      padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + var(--space-lg));
    }

    @media (min-width: 768px) {
      .main-content {
        padding: var(--space-2xl);
        padding-bottom: var(--space-2xl);
      }
    }

    .content-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Premium Mobile Fixed Nav Bar (Glassmorphism) */
    .mobile-nav-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      z-index: 1000;
      /* Glassmorphism Effect - Matching Header, slightly more opaque for coverage */
      background: rgba(11, 15, 20, 0.9) !important;
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border-top: 1px solid var(--color-border);
      /* Height handles nav + safe area */
      height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
      padding-bottom: env(safe-area-inset-bottom);
    }

    .mobile-nav-bar {
      background: transparent !important;
      width: 100%;
      height: var(--bottom-nav-height);
      padding: 0 var(--space-md);
      display: flex;
      justify-content: space-around;
      align-items: center;
      max-width: 600px; /* Optional: limit width on wider screens but keep it a bar */
    }

    @media (min-width: 768px) {
      .mobile-nav-container { display: none; }
    }

    .mobile-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: var(--color-text-muted);
      font-size: 11px;
      font-weight: 500;
      gap: 4px;
      transition: all var(--transition-fast);
      padding: 8px var(--space-sm);
      min-width: 64px;
    }

    .mobile-nav-item mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .mobile-nav-item.active {
      color: var(--color-primary);
    }

    .mobile-nav-item.active span {
      font-weight: 600;
    }

    /* Glow effect for active item */
    .mobile-nav-item.active mat-icon {
      filter: drop-shadow(0 0 8px var(--color-primary-glow));
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
