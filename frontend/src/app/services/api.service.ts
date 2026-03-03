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
        return new HttpHeaders({
            'Authorization': `Bearer ${this.auth.session?.access_token ?? ''}`,
            'Content-Type': 'application/json'
        });
    }

    get<T>(path: string): Observable<T> {
        return this.http.get<T>(`${environment.apiUrl}${path}`, { headers: this.headers });
    }

    post<T>(path: string, body?: any): Observable<T> {
        return this.http.post<T>(`${environment.apiUrl}${path}`, body, { headers: this.headers });
    }

    put<T>(path: string, body?: any): Observable<T> {
        return this.http.put<T>(`${environment.apiUrl}${path}`, body, { headers: this.headers });
    }
}
