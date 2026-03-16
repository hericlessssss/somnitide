import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicProfileComponent } from './public-profile.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('PublicProfileComponent', () => {
  let component: PublicProfileComponent;
  let fixture: ComponentFixture<PublicProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rank Logic', () => {
    it('should return correct title for Top 1', () => {
      expect(component.getRankTitle(1)).toBe('Mestre Supremo do Sono');
    });

    it('should return correct title for Top 2', () => {
      expect(component.getRankTitle(2)).toBe('Mestre do Sono');
    });

    it('should return correct title for Top 3', () => {
      expect(component.getRankTitle(3)).toBe('Guardião do Descanso');
    });

    it('should return correct title for Top 10', () => {
      expect(component.getRankTitle(10)).toBe('Lendário do Sono');
    });

    it('should return correct title for Top 100', () => {
      expect(component.getRankTitle(100)).toBe('Elite do Sono');
    });

    it('should return default title for others', () => {
      expect(component.getRankTitle(101)).toBe('Membro somnitide');
      expect(component.getRankTitle(undefined)).toBe('Membro somnitide');
    });

    it('should return correct CSS class for ranks', () => {
      expect(component.getRankClass(1)).toBe('rank-supreme');
      expect(component.getRankClass(10)).toBe('rank-legendary');
      expect(component.getRankClass(50)).toBe('rank-elite');
      expect(component.getRankClass(101)).toBe('rank-member');
    });

    it('should return correct icon for ranks', () => {
      expect(component.getRankIcon(1)).toBe('workspace_premium');
      expect(component.getRankIcon(10)).toBe('stars');
      expect(component.getRankIcon(101)).toBe('person');
    });
  });
});
