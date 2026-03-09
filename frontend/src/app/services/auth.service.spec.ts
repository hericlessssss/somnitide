import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthService', () => {
    let service: AuthService;
    let supabaseServiceMock: any;
    let authMock: any;

    beforeEach(() => {
        authMock = {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn().mockResolvedValue({ error: null })
        };

        supabaseServiceMock = {
            client: {
                auth: authMock
            }
        };

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                { provide: SupabaseService, useValue: supabaseServiceMock }
            ]
        });
        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call signInWithPassword on login', async () => {
        const email = 'test@example.com';
        const password = 'password123';
        authMock.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });

        const result = await service.signInWithPassword(email, password);

        expect(authMock.signInWithPassword).toHaveBeenCalledWith({ email, password });
        expect(result.error).toBeNull();
    });

    it('should call signUp on register', async () => {
        const email = 'new@example.com';
        const password = 'password123';
        authMock.signUp.mockResolvedValue({ data: { user: {} }, error: null });

        const result = await service.signUp(email, password);

        expect(authMock.signUp).toHaveBeenCalledWith({ email, password });
        expect(result.error).toBeNull();
    });

    it('should call signOut and update session', async () => {
        await service.signOut();
        expect(authMock.signOut).toHaveBeenCalled();
    });

    it('should return error on failed login', async () => {
        const error = { message: 'Invalid credentials' };
        authMock.signInWithPassword.mockResolvedValue({ data: { session: null }, error });

        const result = await service.signInWithPassword('wrong@email.com', 'wrong');

        expect(result.error).toEqual(error);
    });
});
