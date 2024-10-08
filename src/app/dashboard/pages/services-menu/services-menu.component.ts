import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PortalMenu } from '@dashboard/interfaces/portal-menu.interfaz';
import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';

import PortalMenuArr from '@shared/data/portal-menu.json'

import {ServicesMenuImagesPipe} from '@dashboard/pipes/services-menu-images.pipe';
import { LayoutDashComponent } from '@dashboard/layout/layout-dash.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DataDecrypt } from '@shared/classes/data-decrypt';

@Component({
  standalone: true,
  imports: [
    ServicesMenuImagesPipe,
    LoadSpinnerComponent,
    MatCardModule
  ],
  templateUrl: './services-menu.component.html',
  styleUrl: './services-menu.component.css'
})
export class ServicesMenuComponent implements OnInit {

  /* CONTROLA EL RESPONSE DEL CONTENIDO DEL MENU */
  public optionsMenu     = signal<PortalMenu[]>(PortalMenuArr);
  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading       = signal<boolean>(false);
  public isAuthenticated = signal<boolean>(false);
  private identificacion = signal<string>('');
  private tipoIdent      = signal<number>(1);

  private router       = inject(Router);
  /* INJECTA LAYOUT PARA PODER INTERACTUAL CON SUS METODOS */
  private parentLayout = inject(LayoutDashComponent);

  ngOnInit(): void {
    this.parentLayout.showoptions.set(true);
    this.parentLayout.showoptionsMenu.set(false);
    if(!!localStorage.getItem('hbtw_token')) {
      this.isAuthenticated.set(true);
      new DataDecrypt(localStorage.getItem('hbtw_user')!).dataDecrypt()
        .then(r => {
          if(!!r[0].curp) {
            this.identificacion.set(r[0].curp);
            this.tipoIdent.set(2);
          } else {
            this.identificacion.set(r[0].rfc);
            this.tipoIdent.set(1);
          }
        });
    }
  }

  /* NOTA: EMITE EL VALOR DE LA DEPENDECIA SELECCIONADA A LAYOUT */
  emitValCard(id: string): void {
    console.log(id)

    if (new RegExp('^(?:https?):\/\/?').test(id)) {
      window.open(`${id}`);
      return;
    }


    switch(id) {
      case 'buzon-tributario':
        if(!localStorage.getItem('hbtw_token')) {
          Swal.fire('Error', "Para tener acceso a este modulo necesita generar un registro", 'error');
          return;
        }
        this.router.navigate(['dashboard/buzon_contribuyente/messageslist/',2,this.tipoIdent(),1,this.identificacion()])
        break;
      case 'portal-hacienda-servicios':
        this.router.navigate(['/dashboard/'+id]);
        break;
      case 'historial_pagos':
        if(!localStorage.getItem('hbtw_token')) {
          window.open('https://www.hacienda.morelos.gob.mx/index.php/tramites-y-servicios-en-linea/comprobantes-de-pago');
          return;
        }
        this.router.navigate(['dashboard/historial_pagos']);
        break;
      case 'historial_pagos_vehicular':
        this.router.navigate(['dashboard/historial_pagos_vehicular'])
        break;
      case 'auth':
        this.router.navigate(['auth']);
        break;
    }

  }
}
