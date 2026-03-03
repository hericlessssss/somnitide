import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface WakeSuggestion {
    wakeTimeUtc: string;
    cycles: number;
    isRecommended: boolean;
}

export interface SessionResponse {
    id: string;
    startedAtUtc: string;
    sleepStartEstimatedAtUtc: string;
    endedAtUtc: string | null;
    isOpen: boolean;
    qualityRating: number | null;
    note: string | null;
    suggestions?: WakeSuggestion[];
}

@Injectable({
    providedIn: 'root'
})
export class SleepService {
    private api = inject(ApiService);

    startSession(): Observable<SessionResponse> {
        return this.api.post<SessionResponse>('/sessions/start');
    }

    endSession(rating: number, note?: string): Observable<SessionResponse> {
        return this.api.post<SessionResponse>('/sessions/end', { qualityRating: rating, note });
    }

    getHistory(limit: number = 10): Observable<{ activeSession: SessionResponse | null, history: SessionResponse[] }> {
        return this.api.get<{ activeSession: SessionResponse | null, history: SessionResponse[] }>(`/sessions?limit=${limit}`);
    }
}
