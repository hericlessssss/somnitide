import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <h1 class="page-title gradient-text">{{ title }}</h1>
      <p *ngIf="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .page-header {
      padding-top: var(--page-padding-top);
      width: 100%;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
