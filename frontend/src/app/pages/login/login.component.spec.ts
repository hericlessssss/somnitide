import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
    let mockAuthService: any;

    beforeEach(async () => {
        mockAuthService = {
            isAuthenticated: false,
            signInWithPassword: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent, NoopAnimationsModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                provideRouter([])
            ]
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
        expect(component.loginError()).toBeNull();
    });

    it('should set loginError signal on auth failure', async () => {
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;

        mockAuthService.signInWithPassword.mockResolvedValue({
            data: {},
            error: { status: 400, message: 'Invalid login credentials' }
        });

        await component.onLogin();

        expect(component.loginError()).toBe('E-mail ou senha incorretos.');
    });

    it('should toggle password visibility when requested', () => {
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;

        expect(component.hidePassword()).toBe(true);
        component.hidePassword.set(false);
        expect(component.hidePassword()).toBe(false);
    });
});
