import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
    let mockAuthService: any;
    let mockSnackBar: any;

    beforeEach(async () => {
        mockAuthService = {
            isAuthenticated: false,
            signInWithPassword: vi.fn()
        };
        mockSnackBar = {
            open: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent, NoopAnimationsModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: MatSnackBar, useValue: mockSnackBar },
                provideRouter([])
            ]
        }).overrideComponent(LoginComponent, {
            add: { providers: [{ provide: MatSnackBar, useValue: mockSnackBar }] }
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should call signInWithPassword on submit', async () => {
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate');

        component.email = 'test@example.com';
        component.password = 'password123';
        mockAuthService.signInWithPassword.mockResolvedValue({ data: {}, error: null });

        await component.onLogin();

        expect(mockAuthService.signInWithPassword).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should show snackbar on error', async () => {
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;

        mockAuthService.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Failed' } });

        const snack = TestBed.inject(MatSnackBar);
        await component.onLogin();

        expect(snack.open).toHaveBeenCalledWith(expect.stringContaining('Erro: Failed'), expect.anything(), expect.anything());
    });
});
