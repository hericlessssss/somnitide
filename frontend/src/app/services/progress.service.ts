import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface DayResultResponse {
    date: string;
    sleepMinutes: number;
    rating: number | null;
    durationScore: number;
    qualityScore: number;
    streakBonus: number;
    totalScore: number;
}

export interface BestDayResponse {
    date: string;
    score: number;
}

export interface ProgressResponse {
    rangeDays: number;
    streakDays: number;
    avgScore: number;
    avgSleepMinutes: number;
    bestDay: BestDayResponse | null;
    days: DayResultResponse[];
}

@Injectable({
    providedIn: 'root'
})
export class ProgressService {
    private api = inject(ApiService);

    getProgress(days: number = 7): Observable<ProgressResponse> {
        return this.api.get<ProgressResponse>(`/me/progress?days=${days}`);
    }
}
