import { Routes } from '@angular/router';
import { LayoutComponent } from './auth/layout/layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    //canActivate: [isNotAuthenticatedGuard],
    loadComponent: () => import('./auth/layout/layout.component').then(c => c.LayoutComponent),
    children: [
      {
        path: 'login',
        title: 'Login',
        loadComponent: () => import('./auth/pages/login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'register',
        title: 'Register',
        loadComponent: () => import('./auth/pages/register/register.component').then(c => c.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    //canActivate: [isAuthenticatedGuard],
    loadComponent: () => import('./dashboard/layout/layout-dash.component').then(c => c.LayoutDashComponent),
    children: [
      /*{
        path: 'refrendo/:idConcepto/:formulario',
        title: 'Refrendo Vehicular',
        loadComponent: () => import('./portal-servicios/smyt/pages/refrendo-page/refrendo-page.component'),
      },*/

    ]
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./dashboard/pages/not-found-page/not-found-page.component').then(c => c.NotFoundPageComponent)
  }
];
