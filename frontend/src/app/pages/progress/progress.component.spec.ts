import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressComponent } from './progress.component';
import { ProgressService } from '../../services/progress.service';
import { of, throwError } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProgressComponent', () => {
  let component: ProgressComponent;
  let fixture: ComponentFixture<ProgressComponent>;
  let progressService: any;

  beforeEach(async () => {
    progressService = {
      getProgress: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProgressComponent, NoopAnimationsModule],
      providers: [
        { provide: ProgressService, useValue: progressService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressComponent);
    component = fixture.componentInstance;
  });

  it('should create and load data', () => {
    const mockData = {
      rangeDays: 7,
      streakDays: 3,
      avgScore: 85,
      avgSleepMinutes: 450,
      bestDay: { date: '2026-03-10', score: 100 },
      days: []
    };
    progressService.getProgress.mockReturnValue(of(mockData));

    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.data()).toEqual(mockData);
  });

  it('should format sleep minutes correctly', () => {
    expect(component.formatSleepMinutes(450)).toBe('7h 30m');
    expect(component.formatSleepMinutes(60)).toBe('1h 00m');
    expect(component.formatSleepMinutes(0)).toBe('0h 00m');
  });

  it('should return correct rank labels', () => {
    expect(component.getRankLabel(105)).toBe('Mestre do Sono');
    expect(component.getRankLabel(85)).toBe('Alta Performance');
    expect(component.getRankLabel(65)).toBe('Consistente');
    expect(component.getRankLabel(45)).toBe('Em Evolução');
    expect(component.getRankLabel(20)).toBe('Iniciante');
  });

  it('should handle error loading data', () => {
    progressService.getProgress.mockReturnValue(throwError(() => new Error('API Error')));
    
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.data()).toBeNull();
  });
});
