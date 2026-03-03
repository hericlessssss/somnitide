import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface UserPreferences {
    sleepLatencyMinutes: number;
    cycleLengthMinutes: number;
    minCycles: number;
    maxCycles: number;
    bufferMinutes: number;
    updatedAtUtc: string;
}

@Injectable({
    providedIn: 'root'
})
export class PreferencesService {
    private api = inject(ApiService);

    get(): Observable<UserPreferences> {
        return this.api.get<UserPreferences>('/preferences');
    }

    update(prefs: Partial<UserPreferences>): Observable<UserPreferences> {
        return this.api.put<UserPreferences>('/preferences', prefs);
    }
}
