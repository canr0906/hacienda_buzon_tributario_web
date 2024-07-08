import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PortalMenu } from '@dashboard/interfaces/portal-menu.interfaz';
import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';

import PortalMenuArr from '@shared/data/portal-menu.json'

import {ServicesMenuImagesPipe} from '@dashboard/pipes/services-menu-images.pipe';
import { LayoutDashComponent } from '@dashboard/layout/layout-dash.component';
import { Router } from '@angular/router';

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
  public optionsMenu = signal<PortalMenu[]>(PortalMenuArr);

  private router = inject(Router);

  /* INJECTA LAYOUT PARA PODER INTERACTUAL CON SUS METODOS */
  private parentLayout = inject(LayoutDashComponent);

  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.parentLayout.showoptions.set(false);
  }

  /* NOTA: EMITE EL VALOR DE LA DEPENDECIA SELECCIONADA A LAYOUT */
  emitValCard(id: string): void {
    //this.valCardDep.emit(this.cardsArr.filter(({pk}) => pk===id))
    //this.parentLayout.reciveValCard(this.cardsArr.filter(({ pk }) => pk === id));
    console.log('/dashboard/'+id)
    this.router.navigate(['/dashboard/'+id]);
  }
}
