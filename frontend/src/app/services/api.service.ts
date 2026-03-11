import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);

    private get headers(): HttpHeaders {
        const token = this.auth.session?.access_token;
        if (!token) {
            console.warn('ApiService: No access token available for request');
        }
        return new HttpHeaders({
            'Authorization': `Bearer ${token ?? ''}`,
            'Content-Type': 'application/json'
        });
    }

    private buildUrl(path: string): string {
        const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl : `${environment.apiUrl}/`;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${baseUrl}${cleanPath}`;
    }

    get<T>(path: string): Observable<T> {
        return this.http.get<T>(this.buildUrl(path), { headers: this.headers });
    }

    post<T>(path: string, body?: any): Observable<T> {
        return this.http.post<T>(this.buildUrl(path), body, { headers: this.headers });
    }

    put<T>(path: string, body?: any): Observable<T> {
        return this.http.put<T>(this.buildUrl(path), body, { headers: this.headers });
    }
}
