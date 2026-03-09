import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RegisterComponent', () => {
    let mockAuthService: any;
    let mockSnackBar: any;

    beforeEach(async () => {
        mockAuthService = {
            signUp: vi.fn()
        };
        mockSnackBar = {
            open: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, NoopAnimationsModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: MatSnackBar, useValue: mockSnackBar },
                provideRouter([])
            ]
        }).overrideComponent(RegisterComponent, {
            add: { providers: [{ provide: MatSnackBar, useValue: mockSnackBar }] }
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should call signUp on submit if passwords match', async () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate');

        component.email = 'new@example.com';
        component.password = 'password123';
        component.confirmPassword = 'password123';
        mockAuthService.signUp.mockResolvedValue({ data: {}, error: null });

        await component.onRegister();

        expect(mockAuthService.signUp).toHaveBeenCalledWith('new@example.com', 'password123');
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should show error if passwords do not match', async () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;

        component.password = 'password123';
        component.confirmPassword = 'different';

        const snack = TestBed.inject(MatSnackBar);
        await component.onRegister();

        expect(snack.open).toHaveBeenCalledWith('As senhas não conferem.', expect.anything(), expect.anything());
        expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });
});
