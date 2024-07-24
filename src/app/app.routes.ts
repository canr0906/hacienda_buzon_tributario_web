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
      {
        path: 'sevices-menu',
        title: 'Menu de Servicios',
        loadComponent: () => import('./dashboard/pages/services-menu/services-menu.component').then(c => c.ServicesMenuComponent),
      },
      {
        path: 'portal-hacienda-servicios',
        title: 'Menu de Portal de Hacienda',
        loadComponent: () => import('./dashboard/pages/portal-hacienda-services/portal-hacienda-menu/portal-hacienda-menu.component').then(c => c.PortalHaciendaMenuComponent),
      },
      {
        path: 'smyt/smyt-refrendo',
        title: 'Pago de Refrendo Vehicular',
        loadComponent: () => import('./dashboard/pages/portal-hacienda-services/smyt/refrendo/refrendo.component').then(c=>c.RefrendoComponent)
      },
      {
        path: 'tabla-conceptos/:idConcepto',
        title: 'Tabla de Conceptos',
        loadComponent: () => import('./dashboard/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component').then(c =>c.TablaCalculoConceptosComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard/sevices-menu',
        pathMatch: 'full'
      }
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
