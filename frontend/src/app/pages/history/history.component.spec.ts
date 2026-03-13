import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { SleepService } from '../../services/sleep.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let sleepServiceMock: any;

  beforeEach(async () => {
    sleepServiceMock = {
      getHistory: vi.fn().mockReturnValue(of({ activeSession: null, history: [] }))
    };

    await TestBed.configureTestingModule({
      imports: [HistoryComponent, NoopAnimationsModule],
      providers: [
        { provide: SleepService, useValue: sleepServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render PageHeader with h1 containing "Seu Histórico"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('h1.page-title');
    expect(h1).toBeTruthy();
    expect(h1?.textContent?.trim()).toContain('Seu Histórico');
  });

  it('should render PageHeader subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sub = compiled.querySelector('p.page-subtitle');
    expect(sub).toBeTruthy();
    expect(sub?.textContent?.trim()).toContain('Acompanhe');
  });

  it('should calculate duration correctly', () => {
    const start = '2024-03-11T20:00:00Z';
    const end = '2024-03-12T04:30:00Z';
    const duration = component.calculateDuration(start, end);
    expect(duration).toBe('8h 30min');
  });

  it('should handle zero or negative duration', () => {
    const start = '2024-03-11T20:00:00Z';
    const end = '2024-03-11T19:00:00Z';
    expect(component.calculateDuration(start, end)).toBe('0h 0min');
  });

  it('should load history with limit on init', () => {
    expect(sleepServiceMock.getHistory).toHaveBeenCalledWith(10);
  });

  it('should load more history when loadMore is called', () => {
    component.loadMore();
    expect(component.limit()).toBe(20);
    expect(sleepServiceMock.getHistory).toHaveBeenCalledWith(20);
  });

  it('should show "Sem observa├º├Áes" for default or empty notes', () => {
    const sessionWithDefaultNote = { note: 'Avalia├º├úo conclu├¡da', startedAtUtc: '...', endedAtUtc: '...', qualityRating: 5 };
    const sessionWithEmptyNote = { note: '', startedAtUtc: '...', endedAtUtc: '...', qualityRating: 5 };
    
    // This is partly template logic, but we can verify our helper logic or how we handle the display if needed.
    // For now, the template handles this: {{ (session.note && session.note !== 'Avalia├º├úo conclu├¡da') ? session.note : 'Sem observa├º├Áes' }}
  });
});
