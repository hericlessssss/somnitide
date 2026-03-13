import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
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

    it('should return correct CSS class for supreme rank', () => {
      expect(component.getRankClass(1)).toBe('rank-supreme');
    });

    it('should return person icon for non-ranked users', () => {
      expect(component.getRankIcon(undefined)).toBe('person');
      expect(component.getRankIcon(101)).toBe('person');
    });
  });
});
