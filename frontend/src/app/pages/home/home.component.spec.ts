import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let mockAuthService: any;

    beforeEach(async () => {
        mockAuthService = {
            isAuthenticated: true
        };

        await TestBed.configureTestingModule({
            imports: [
                HomeComponent,
                MatDialogModule,
                MatSnackBarModule,
                HttpClientTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: mockAuthService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the current time', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const timeDisplay = compiled.querySelector('.time');
        expect(timeDisplay?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should display the timezone', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const timezoneDisplay = compiled.querySelector('.timezone-label');
        expect(timezoneDisplay).toBeTruthy();
        // Expect format like "GMT-3" or "Brasília" or similar
        expect(timezoneDisplay?.textContent?.length).toBeGreaterThan(0);
    });

    it('should have a centered hero section with consistent padding', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const heroContent = compiled.querySelector('.hero-content');
        const styles = window.getComputedStyle(heroContent!);
        expect(styles.display).toBe('flex');
        expect(styles.flexDirection).toBe('column');
        expect(styles.alignItems).toBe('center');
    });

    describe('getHealthStatus', () => {
        it('should return critical for 2 cycles', () => {
            const status = component.getHealthStatus(2);
            expect(status.level).toBe('critical');
            expect(status.label).toBe('Crítico');
        });

        it('should return critical/insuficiente for 3 cycles', () => {
            const status = component.getHealthStatus(3);
            expect(status.level).toBe('critical');
            expect(status.label).toBe('Insuficiente');
        });

        it('should return warning/mínimo for 4 cycles', () => {
            const status = component.getHealthStatus(4);
            expect(status.level).toBe('warning');
            expect(status.label).toBe('Mínimo');
        });

        it('should return info/ideal for 5 cycles', () => {
            const status = component.getHealthStatus(5);
            expect(status.level).toBe('info');
            expect(status.label).toBe('Ideal');
        });

        it('should return warning/longo for 7 cycles', () => {
            const status = component.getHealthStatus(7);
            expect(status.level).toBe('warning');
            expect(status.label).toBe('Longo');
        });
    });
});
