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
        const { error } = await this.supabase.client.auth.signOut();
        if (!error) {
            this._session.set(null);
        }
        return { error };
    }

    async signInWithPassword(email: string, password: string) {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
            email,
            password
        });
        if (data.session) {
            this._session.set(data.session);
        }
        return { data, error };
    }

    async signUp(email: string, password: string) {
        const { data, error } = await this.supabase.client.auth.signUp({
            email,
            password
        });
        return { data, error };
    }
}
