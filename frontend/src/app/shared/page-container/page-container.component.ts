import { Component } from '@angular/core';

@Component({
  selector: 'app-page-container',
  standalone: true,
  template: `
    <div class="page-container">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .page-container {
      max-width: var(--page-max-width);
      width: 100%;
      margin: 0 auto;
      padding: 0 var(--page-padding-x) calc(var(--bottom-nav-height) + var(--space-2xl));
      display: flex;
      flex-direction: column;
      gap: var(--page-content-gap);
    }
  `]
})
export class PageContainerComponent {}
