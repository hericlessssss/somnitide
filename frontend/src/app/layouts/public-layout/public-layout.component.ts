import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="public-layout">
      <div class="glass-container">
        <router-outlet />
      </div>
      <div class="ambient-light"></div>
    </div>
  `,
  styles: `
    .public-layout {
      min-height: 100dvh;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: var(--color-bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(79, 209, 197, 0.1) 0, transparent 60%),
        radial-gradient(at 100% 100%, rgba(129, 140, 248, 0.1) 0, transparent 60%);
      background-attachment: fixed;
      padding: var(--space-xl); 
      position: relative;
      overflow: hidden;
      -webkit-overflow-scrolling: touch;
    }
    .glass-container {
      width: 100%;
      max-width: 440px;
      display: flex;
      justify-content: center;
      z-index: 2;
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ambient-light {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(66, 214, 198, 0.08) 0%, transparent 70%);
      z-index: 1;
      pointer-events: none;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `


})
export class PublicLayoutComponent { }

