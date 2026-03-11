import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface UserProfile {
  userId: string;
  handle: string;
  avatarSeed: string;
  totalScore: number;
  updatedAtUtc: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private api = inject(ApiService);

  getMyProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('profiles/me');
  }

  updateProfile(handle: string): Observable<UserProfile> {
    return this.api.post<UserProfile>('profiles/me', { handle });
  }

  getTop100(): Observable<UserProfile[]> {
    return this.api.get<UserProfile[]>('ranking');
  }

  getPublicProfile(handle: string): Observable<UserProfile> {
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    return this.api.get<UserProfile>(`ranking/profile/${cleanHandle}`);
  }
}
