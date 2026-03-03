import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Session, User } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _session = signal<Session | null>(null);

    constructor(private supabase: SupabaseService) {
        this.supabase.client.auth.getSession().then(({ data: { session } }) => {
            this._session.set(session);
        });

        this.supabase.client.auth.onAuthStateChange((_event, session) => {
            this._session.set(session);
        });
    }

    get session() {
        return this._session();
    }

    get user(): User | null {
        return this._session()?.user ?? null;
    }

    get isAuthenticated(): boolean {
        return !!this._session();
    }

    async signOut() {
        await this.supabase.client.auth.signOut();
    }

    // Basic email/password sign-in for testing/dev
    async signIn(email: string) {
        const { error } = await this.supabase.client.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        return { error };
    }
}
