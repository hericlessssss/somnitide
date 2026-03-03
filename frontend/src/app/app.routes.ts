import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'history',
        loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent),
        canActivate: [authGuard]
    },
    {
        path: 'preferences',
        loadComponent: () => import('./pages/preferences/preferences.component').then(m => m.PreferencesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
