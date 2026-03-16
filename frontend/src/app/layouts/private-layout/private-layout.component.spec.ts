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

    it('should render title and navigation links', () => {
        const fixture = TestBed.createComponent(PrivateLayoutComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;

        // Brand
        expect(compiled.querySelector('.brand-name')?.textContent).toContain('somnitide');

        // Desktop Nav
        expect(compiled.querySelector('.desktop-nav a[routerLink="/home"]')).toBeTruthy();
        expect(compiled.querySelector('.desktop-nav a[routerLink="/history"]')).toBeTruthy();
        expect(compiled.querySelector('.desktop-nav a[routerLink="/insights"]')).toBeTruthy();

        // Mobile Nav
        expect(compiled.querySelector('.mobile-nav-bar a[routerLink="/home"]')).toBeTruthy();
        expect(compiled.querySelector('.mobile-nav-bar a[routerLink="/history"]')).toBeTruthy();
    });

    it('should have correct structural classes for main content and bottom nav', () => {
        const fixture = TestBed.createComponent(PrivateLayoutComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;

        const mainContent = compiled.querySelector('.main-content');
        expect(mainContent).toBeTruthy();
        expect(mainContent?.classList.contains('fade-in')).toBe(true);

        const navContainer = compiled.querySelector('.mobile-nav-container');
        expect(navContainer).toBeTruthy();
        expect(navContainer?.classList.contains('fade-in')).toBe(true);
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
