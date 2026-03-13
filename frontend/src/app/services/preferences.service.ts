import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface UserPreferences {
    userId: string;
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

    getPreferences(): Observable<UserPreferences> {
        return this.api.get<UserPreferences>('/preferences');
    }
}
