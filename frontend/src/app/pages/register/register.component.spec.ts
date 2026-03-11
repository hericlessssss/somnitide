import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
    let mockAuthService: any;

    beforeEach(async () => {
        mockAuthService = {
            signUp: vi.fn()
        };
        const mockProfileService = {
            updateProfile: vi.fn().mockReturnValue(of({}))
        };

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, NoopAnimationsModule, MatSnackBarModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: ProfileService, useValue: mockProfileService },
                provideRouter([])
            ]
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should call signUp on submit if passwords match and are valid', async () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;
        const router = TestBed.inject(Router);
        const profileService = TestBed.inject(ProfileService);
        const navigateSpy = vi.spyOn(router, 'navigate');

        component.handle = 'testuser';
        component.email = 'new@example.com';
        component.password = 'password123';
        component.confirmPassword = 'password123';
        mockAuthService.signUp.mockResolvedValue({ data: { session: {} }, error: null });

        await component.onRegister();

        expect(mockAuthService.signUp).toHaveBeenCalledWith('new@example.com', 'password123');
        expect(profileService.updateProfile).toHaveBeenCalledWith('testuser');
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
        expect(component.registerError()).toBeNull();
    });

    it('should set registerError if passwords do not match', async () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;

        component.password = 'password123';
        component.confirmPassword = 'different';

        await component.onRegister();

        expect(component.registerError()).toBe('As senhas não conferem.');
        expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should set registerError if password is too short', async () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;

        component.password = '123';
        component.confirmPassword = '123';

        await component.onRegister();

        expect(component.registerError()).toBe('A senha deve ter pelo menos 6 caracteres.');
        expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should toggle visibility signals when requested', () => {
        const fixture = TestBed.createComponent(RegisterComponent);
        const component = fixture.componentInstance;

        expect(component.hidePassword()).toBe(true);
        component.hidePassword.set(false);
        expect(component.hidePassword()).toBe(false);

        expect(component.hideConfirmPassword()).toBe(true);
        component.hideConfirmPassword.set(false);
        expect(component.hideConfirmPassword()).toBe(false);
    });
});
