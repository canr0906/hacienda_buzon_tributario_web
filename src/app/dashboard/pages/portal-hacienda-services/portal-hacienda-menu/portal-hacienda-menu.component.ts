import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { DataConceptsStruct } from '@shared/interfaces/concepts-response-struct.interface';
import { LayoutDashComponent } from '@dashboard/layout/layout-dash.component';
import {HaciendaMenuImagesPipe} from '@dashboard/pipes/hacienda-menu-images.pipe';
import { ServiciosHaciendaPortalService } from '@dashboard/services/servicios-hacienda-portal.service';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    HaciendaMenuImagesPipe,
    LoadSpinnerComponent,
    MatCardModule
  ],
  templateUrl: './portal-hacienda-menu.component.html',
  styleUrl: './portal-hacienda-menu.component.css'
})
export class PortalHaciendaMenuComponent implements OnInit, OnDestroy {

  /* INJECTA LAYOUT PARA PODER INTERACTUAL CON SUS METODOS */
  private parentLayout = inject(LayoutDashComponent);

  /* INYECCION DE SERVICIO PARA CONSULTA DE DEPENDENCIAS */
  private generalService = inject(ServiciosHaciendaPortalService);

  /* LISTA DE CONCEPTOS DE LA DEPENDENCIA SELECCIONADA */
  public cardsArr: DataConceptsStruct[] = [];

  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading = signal<boolean>(false);

  private activRoute = inject(ActivatedRoute);
  private activRouteSubs?: Subscription;

  ngOnInit(): void {

    this.parentLayout.showoptions.set(true);

    this.activRouteSubs = this.activRoute.params.subscribe(({ flag }) => {
      if (!flag) {
        this.parentLayout.redirectHome(true);
      }
      this.generalService.requestConceptos(0)
        .subscribe({
          next: (conceptos) => {
            const result = conceptos.filter(resp => resp.rol == 0);
            if (result.length > 0) {
              this.cardsArr = result;
              return;
            }

            this.cardsArr = [];
            this.isLoading.set(false);
            return;
          }
        });

          /*conceptos => {
          const result = conceptos.filter(resp => resp.rol == 0);
          if (result.length > 0) {
            this.cardsArr = result;
            return;
          }

          this.cardsArr = [];
          this.isLoading.set(false);
          return;

        });*/
    });
  }

  ngOnDestroy(): void {
    this.activRouteSubs?.unsubscribe();
  }

  /* NOTA: EMITE EL VALOR DE LA DEPENDECIA SELECCIONADA A LAYOUT */
  emitValCard(id: number): void {
    this.parentLayout.reciveValCard(this.cardsArr.filter(({ pk }) => pk === id));
  }
}
