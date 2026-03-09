import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="public-layout fade-in">
      <div class="glass-container">
        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    .public-layout {
      height: 100dvh;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--bg-primary);
      background-image: 
        radial-gradient(at 0% 0%, rgba(79, 209, 197, 0.1) 0, transparent 60%),
        radial-gradient(at 100% 100%, rgba(129, 140, 248, 0.1) 0, transparent 60%);
      padding: var(--space-lg);
      overflow: hidden;
    }
    .glass-container {
      width: 100%;
      max-width: 440px;
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `


})
export class PublicLayoutComponent { }

