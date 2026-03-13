import { TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('PageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentInstance.title = 'Test Title';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('.page-title');
    expect(titleElement?.textContent).toContain('Test Title');
  });

  it('should render the subtitle if provided', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentInstance.subtitle = 'Test Subtitle';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitleElement = compiled.querySelector('.page-subtitle');
    expect(subtitleElement?.textContent).toContain('Test Subtitle');
  });

  it('should not render the subtitle if not provided', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentInstance.subtitle = '';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitleElement = compiled.querySelector('.page-subtitle');
    expect(subtitleElement).toBeNull();
  });

  it('should apply structural and typography classes correctly', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentInstance.title = 'Title';
    fixture.componentInstance.subtitle = 'Sub';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check h1
    const h1 = compiled.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.classList.contains('page-title')).toBe(true);
    expect(h1?.classList.contains('gradient-text')).toBe(true);

    // Check p
    const p = compiled.querySelector('p');
    expect(p).toBeTruthy();
    expect(p?.classList.contains('page-subtitle')).toBe(true);
  });
});
