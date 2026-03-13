import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { SleepService } from '../../services/sleep.service';
import { PreferencesService } from '../../services/preferences.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let mockAuthService: any;
    let mockSleepService: any;
    let mockPreferencesService: any;
    let mockDialog: any;
    let mockSnack: any;

    beforeEach(async () => {
        mockAuthService = { isAuthenticated: true };
        mockSleepService = {
            getHistory: vi.fn().mockReturnValue(of({ activeSession: null, history: [] })),
            startSession: vi.fn(),
            endSession: vi.fn().mockReturnValue(of({}))
        };
        mockPreferencesService = {
            getPreferences: vi.fn().mockReturnValue(of({ 
                cycleLengthMinutes: 90,
                updatedAtUtc: new Date().toISOString() 
            }))
        };
        mockDialog = {
            open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) })
        };
        mockSnack = {
            open: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [
                HomeComponent,
                HttpClientTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: SleepService, useValue: mockSleepService },
                { provide: PreferencesService, useValue: mockPreferencesService },
                { provide: MatDialog, useValue: mockDialog },
                provideRouter([])
            ]
        })
        .overrideComponent(HomeComponent, {
            add: {
                providers: [
                    { provide: MatSnackBar, useValue: mockSnack }
                ]
            }
        })
        .compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    // Smoke test: verifica que o PageHeader est├í presente com o t├¡tulo correto
    it('should render PageHeader with h1 containing the page title', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        const h1 = compiled.querySelector('h1.page-title');
        expect(h1).toBeTruthy();
        expect(h1?.textContent?.trim()).toContain('Status do Sono');
    });

    // Smoke test: verifica que o subt├¡tulo est├í presente
    it('should render PageHeader with a subtitle paragraph', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        const sub = compiled.querySelector('p.page-subtitle');
        expect(sub).toBeTruthy();
        expect(sub?.textContent?.trim()).toContain('Pronto para descansar');
    });
    describe('endSession', () => {
        it('should show info message and skip modal if session is too short', async () => {
            const now = Date.now();
            const startedAt = new Date(now - 5 * 60 * 1000).toISOString();
            
            mockSleepService.getHistory.mockReturnValue(of({ 
                activeSession: {
                    id: '123',
                    startedAtUtc: startedAt,
                    sleepStartEstimatedAtUtc: startedAt,
                    isOpen: true,
                    endedAtUtc: null,
                    qualityRating: null,
                    note: null
                }, 
                history: [] 
            }));
            
            component.refreshStatus();
            component.cycleLength.set(90);
            await fixture.whenStable();
            fixture.detectChanges();

            // Action
            component.endSession();
            await fixture.whenStable();
            fixture.detectChanges();
            await new Promise(resolve => setTimeout(resolve, 0)); // tick microtasks
            fixture.detectChanges();
            
            expect(mockDialog.open).not.toHaveBeenCalled();
            expect(mockSleepService.endSession).toHaveBeenCalledWith(null, 'Sessão muito curta');
            expect(mockSnack.open).toHaveBeenCalled();
            expect(component.activeSession()).toBeNull();
        });

        it('should open modal if session duration is met', async () => {
            const now = Date.now();
            const startedAt = new Date(now - 100 * 60 * 1000).toISOString();
            
            mockSleepService.getHistory.mockReturnValue(of({ 
                activeSession: {
                    id: '123',
                    startedAtUtc: startedAt,
                    sleepStartEstimatedAtUtc: startedAt,
                    isOpen: true,
                    endedAtUtc: null,
                    qualityRating: null,
                    note: null
                }, 
                history: [] 
            }));
            
            component.refreshStatus();
            await fixture.whenStable();
            fixture.detectChanges();

            component.endSession();
            await fixture.whenStable();
            
            expect(mockDialog.open).toHaveBeenCalled();
        });
    });
});
