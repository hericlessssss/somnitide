import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    template: `
    <div class="public-layout">
      <router-outlet />
    </div>
  `,
    styles: `
    .public-layout {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
    }
  `
})
export class PublicLayoutComponent { }
