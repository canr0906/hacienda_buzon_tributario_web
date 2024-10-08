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
        path: 'tabla-conceptos/:idConcepto/:tipoForm',
        title: 'Tabla de Conceptos',
        loadComponent: () => import('./dashboard/components/tabla-calculo-conceptos/tabla-calculo-conceptos.component').then(c =>c.TablaCalculoConceptosComponent),
      },
      {
        path: 'datos-contribuyente',
        title: 'Datos Contribuyente',
        loadComponent: () => import('./dashboard/components/tax-payer-data/tax-payer-data.component').then(c => c.TaxPayerDataComponent),
      },
      {
        path: 'generar_poliza',
        title: 'Generar Póliza',
        loadComponent: () => import('./dashboard/components/datos-poliza/datos-poliza.component').then(c => c.DatosPolizaComponent)
      },
      {
        path: 'buzon_contribuyente',
        title: 'Buzón Contribuyente',
        loadComponent: () => import('./dashboard/pages/buzon-contribuyente/buzon-contribuyente.component').then(c => c.BuzonContribuyenteComponent),
        children: [
          {
            path: 'messageslist/:sistema/:tipoIdent/:incGeneral/:credential',
            title: 'Lista de Mensajes',
            loadComponent: () => import('./dashboard/pages/buzon-contribuyente/messages-list/messages-list.component').then(c => c.MessagesListComponent)
          },
          {
            path: '',
            redirectTo: 'buzon_contribuyente',
            pathMatch: 'full'
          },
          /*{
            path: '**',
            loadComponent: () => import('./dashboard/pages/not-found-page/not-found-page.component').then(c => c.NotFoundPageComponent)
          }*/
        ]
      },
      {
        path: 'historial_pagos',
        title: 'Histórico de Pagos',
        loadComponent: () => import('./dashboard/pages/historico-pagos/historico-pagos.component').then(c => c.HistoricoPagosComponent)
      },
      {
        path: 'historial_pagos_vehicular',
        title: 'Histórico de Pagos Vehicular',
        loadComponent: () => import('./dashboard/pages/historico-pagos-vehiculos/historico-pagos-vehiculos.component').then(c => c.HistoricoPagosVehiculosComponent)
      },
      {
        path: '',
        redirectTo: 'sevices-menu',
        pathMatch: 'full'
      },
      /*{
        path: '**',
        loadComponent: () => import('./dashboard/pages/not-found-page/not-found-page.component').then(c => c.NotFoundPageComponent)
      }*/
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
