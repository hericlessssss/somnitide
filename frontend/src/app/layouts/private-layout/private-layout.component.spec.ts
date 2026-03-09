import { TestBed } from '@angular/core/testing';
import { PrivateLayoutComponent } from './private-layout.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PrivateLayoutComponent', () => {
    let mockAuthService: any;

    beforeEach(async () => {
        mockAuthService = {
            isAuthenticated: true,
            signOut: vi.fn().mockResolvedValue({ error: null })
        };

        await TestBed.configureTestingModule({
            imports: [PrivateLayoutComponent],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                provideRouter([])
            ]
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(PrivateLayoutComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should render title and links', () => {
        const fixture = TestBed.createComponent(PrivateLayoutComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('span[routerLink="/home"]')?.textContent).toContain('Somnitide');
        expect(compiled.querySelector('button[routerLink="/history"]')).toBeTruthy();
        expect(compiled.querySelector('button[routerLink="/preferences"]')).toBeTruthy();
    });

    it('should call signOut and navigate on logout click', async () => {
        const fixture = TestBed.createComponent(PrivateLayoutComponent);
        const component = fixture.componentInstance;
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate');

        await component.onLogout();
        expect(mockAuthService.signOut).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
});
