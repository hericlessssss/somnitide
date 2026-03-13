import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './layouts/private-layout/private-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            {
                path: 'login',
                loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        component: PrivateLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'home',
                loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'history',
                loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent)
            },
            {
                path: 'insights',
                loadComponent: () => import('./pages/insights/insights.component').then(m => m.InsightsComponent)
            },
            {
                path: 'progress',
                loadComponent: () => import('./pages/progress/progress.component').then(m => m.ProgressComponent)
            },
            {
                path: 'ranking',
                loadComponent: () => import('./pages/ranking/ranking.component').then(m => m.RankingComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'profile/:handle',
                loadComponent: () => import('./pages/profile/public-profile/public-profile.component').then(m => m.PublicProfileComponent)
            },
            {
                path: 'docs',
                loadComponent: () => import('./pages/docs/docs.component').then(m => m.DocsComponent)
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
