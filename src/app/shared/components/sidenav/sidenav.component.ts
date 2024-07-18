import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';

import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import { DataConceptsStruct } from '@shared/interfaces/concepts-response-struct.interface';
import { UserStruct } from '@auth/interfaces/user-struct.interface';
import { Subject } from 'rxjs';
import { ServiciosHaciendaPortalService } from '@dashboard/services/servicios-hacienda-portal.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

export interface IdPadre {
  padreId: number
}

@Component({
  selector: 'hacienda-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    LoadSpinnerComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent implements OnInit, AfterViewInit, OnDestroy {

  /* NOTA: RECIBE EL EVENTO DE CERRAR O ABRIR MENU DEL PADRE LAYOUT Y ESTE A AU VEZ LO RECIBE DEL HIJO TOOLBAR */
  @Input()
  public reciveActionSideNav: Subject<boolean> = new Subject<boolean>();
  /* NOTA: RECIBE UN OBJETO DEL PADRE LAYOUT DE LA DEPENDECIA SELECCIONADA POR EL HIJO DEPENDENCIAS-CARD */
  @Input()
  public valDependenciaCard: Subject<DataConceptsStruct[]> = new Subject<DataConceptsStruct[]>();
  /* NOTA: CONTROLA LA ACCION SOBRE EL SIDENAV DE ACUERDO A LA ACCION DEL HERMANO TOOLBAR */
  @ViewChild('sidenav')
  public changSidenav!: MatSidenav;
  /* NOTA: ENVIA AL PADRE EL NOMBRE DEL CONCEPTO SELECCIONADO */
  @Output()
  private nameConcept = new EventEmitter<string>();
  /* NOTA: RECIBE LA ORDEN DEL PADRE PARA BORRAR LA LISTA DE CONCEPTOS */
  @Input()
  public eraseLocalStor: Subject<boolean> = new Subject<boolean>();//: boolean = false

  /* NOTA: EN LOS MENUS ANIDADOS CONTROLA EL BOTON DE BACK */
  public showBack = signal<boolean>(false);
  /* NOTA: CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading = signal<boolean>(false);
  /* MANEJO DE ARREGLO DE CONCEPTOS A MOSTRAR */
  public conceptsArr = signal<DataConceptsStruct[]>([]);
  public showMessage = signal<boolean>(false);
  public showMessage_errReq = signal<boolean>(false);
  /*NOTA: LISTA DE CONCEPTOS DE LA DEPENDENCIA SELECCIONADA */
  public itemsConceptos = signal<DataConceptsStruct[]>([]);

  private generalService = inject(ServiciosHaciendaPortalService);
  private router = inject(Router);

  /* MANEJO DE LA ESTRUCTURA DE RESPONSE DE USUARIO LOGEADO */
  //private roles: UserStruct = JSON.parse(localStorage.getItem('hbtw_user')!);

  ngOnInit(): void {
    /* AL DIR CLICK EN EL ICONO MENU DEL TOOLBAR SE DISPARA ESTA ACCION */
    this.reciveActionSideNav.subscribe(() => {
      this.changSidenav.toggle();
    });
    /* NOTA: SE EJECUTA CUANDO EN EL TOOLBAR SE PRECIONA HOME  */
    this.eraseLocalStor.subscribe(() => {
      //localStorage.clear();
      localStorage.removeItem('hbtw_contribuyente_only');
      localStorage.removeItem('hbtw_vehicle_data');
      localStorage.removeItem('hbtw_vehicle_data_adicional');
      localStorage.removeItem('hbtw_datos_poliza');
      localStorage.removeItem('hbtw_datos_cobro');
      localStorage.removeItem('hbtw_idParent');
      localStorage.removeItem('hbtw_gestora');
      localStorage.removeItem('hbtw_route_origen');
      localStorage.removeItem('hbtw_concept');
      localStorage.removeItem('hbtw_contribuyente');
      localStorage.removeItem('hbtw_datos_poliza');
      localStorage.removeItem('hbtw_repetir_concepto');
      localStorage.removeItem('hbtw_cachestore');

      this.conceptsArr.set([]);
      //this.changSidenav.toggle();
      this.showMessage.set(true);
      this.showMessage_errReq.set(false);
      this.showBack.set(false);
      this.router.navigate(['/dashboard/portal-hacienda-servicios']);//['/pagos']);
    })
  }

  ngAfterViewInit(): void {
    /*
      NOTA: OBSERVACLE EN ESPERA DE VALORES DE DEPENDENCIA SELECCIONADA,
      VALORES QUE SON ENVIADOS POR DEPENDENCIAS-CARDS
    */
    this.valDependenciaCard.subscribe(resp => {
      //this.processChangeOnView(resp[0].padreId);
      console.log(resp)
      localStorage.removeItem('hbtw_idParent');
      this.activeIdParent(resp[0].pk, 0, resp[0].pk);
    });
  }

  ngOnDestroy(): void {
    this.reciveActionSideNav.unsubscribe();
    //this.eraseLocalStor.unsubscribe();
    this.valDependenciaCard.unsubscribe();
  }

  activeIdParent(padreId: number, idConcepto: number, id: number) {
    let x: IdPadre[] = JSON.parse(localStorage.getItem('hbtw_idParent')!);
    if (x) {
      x.push({ 'padreId': padreId });//x.forEach(() => x.push({ 'padreId': padreId }))
      localStorage.setItem('hbtw_idParent', JSON.stringify(x));
    } else {
      localStorage.setItem('hbtw_idParent', JSON.stringify([{ padreId: padreId }]));
    }

    this.buildMenu((idConcepto > 0) ? idConcepto : id);
    if (JSON.parse(localStorage.getItem('hbtw_idParent')!).length > 1)
      this.showBack.set(true);

    return;
  }

  buildMenu(padreId: number) {
    this.isLoading.set(true);
    if (!localStorage.getItem('hbtw_idParent') || JSON.parse(localStorage.getItem('hbtw_idParent')!).length <= 1) {
      this.showBack.set(false);
    }
    this.generalService.requestConceptos(padreId)
      .subscribe(conceptos => {
        console.log(conceptos)
        if (conceptos !== undefined) {
          const result = conceptos.filter(resp => resp.rol == 0);
          if (result.length > 0) {
            this.generalService.conceptoStorage = result;
            this.showMessage.set(false);
            this.showMessage_errReq.set(false);
            this.conceptsArr.set(result);//update(() => [...this.conceptsArr(), result]);
            this.isLoading.set(false);
            if (this.changSidenav.opened == false)
              this.changSidenav.toggle();
            return;
          }

          this.conceptsArr.set([]);
          this.showMessage.set(true);
          this.isLoading.set(false);
          return;
        }
        this.showMessage_errReq.set(true);
        this.isLoading.set(false);
        this.conceptsArr.set([]);
      });


  }

  backMenu() {
    if (localStorage.getItem('hbtw_idParent')) {
      localStorage.removeItem('hbtw_contribuyente');
      let idParent: IdPadre[] = JSON.parse(localStorage.getItem('hbtw_idParent')!);
      const idControl = idParent[idParent.length - 2].padreId;
      idParent.pop();
      if (idParent.length === 0) {
        localStorage.removeItem('hbtw_idParent');
        this.showBack.set(false);
      }
      localStorage.setItem('hbtw_idParent', JSON.stringify(idParent))
      this.buildMenu(idControl);
      this.router.navigate(['/dashboard/portal-hacienda-servicios', true]);
      return;
    }
    return;
  }

  async buidMenuAsync(roles: string, idConcept: number, flag: number, flagChildControl?: number) {
    /*await this.generalService.requestConcepts(roles, idConcept, flag)
      .then(request => request.json())
      .then((resp: Conceptos) => {
        if (resp.success == true) {
          if (resp.data.length > 0) {
            resp.data.map((concepts, k) => {
              if (concepts.gestora === 0) {
                if (concepts.url !== null)
                  return;
                this.controlAddItem.set(concepts.pk,0);
                this.buidMenuAsync(this.roles.roles, concepts.pk, 0, 1)
                  .then(respB => {
                    if (this.controlAddItem.get(concepts.pk) == 1) {
                      this.conceptsArr.update(() => [...this.conceptsArr(), concepts]);
                    }
                  });

              } else {
                if (this.roles.roles.includes(concepts.rol.toString())) {
                  if (flagChildControl !== 1) {
                    this.conceptsArr.update(() => [...this.conceptsArr(), concepts]);
                  }
                  this.controlAddItem.set(idConcept,1);
                }
              }
            });
          } else {
            return;
          }
        } else {
          return;
        }
      })
      .catch(error => console.log('ERRRROOOOOOO: ' + error));*/
  }

  dellLocalStore() {
    if (localStorage.getItem('hbtw_contribuyente_only'))
      localStorage.removeItem('hbtw_contribuyente_only');
    if (localStorage.getItem('hbtw_vehicle_data'))
      localStorage.removeItem('hbtw_vehicle_data');
    if (localStorage.getItem('hbtw_vehicle_data_adicional'))
      localStorage.removeItem('hbtw_vehicle_data_adicional');
    if (localStorage.getItem('hbtw_datos_poliza'))
      localStorage.removeItem('hbtw_datos_poliza');
    if (localStorage.getItem('hbtw_datos_cobro'))
      localStorage.removeItem('hbtw_datos_cobro');
  }

  buildTitle(concept: string) {
    localStorage.setItem('hbtw_concept', concept);
    this.nameConcept.emit(concept);
  }

  actionList(item: string, concept: string, id: number, idConcepto: string | number, padreId: number, gestora?: number) {
    /*
      NOTA:  DETERMINA SI EL CONCEPTO PERMITE AGREGAR MAS CONCEPTOS DE SU SECCION
    */
      if (Number(gestora) > 0) {
        if (this.generalService.conceptoStorage.filter(resp => resp.idConcepto === Number(idConcepto) && resp.combinable == 1).length == 0) {
          (localStorage.getItem('hbtw_contribuyente')) ? localStorage.removeItem('hbtw_contribuyente') : '';
        }
      }

      if (new RegExp('^(?:https?):\/\/?').test(item)) {
        window.open(`${item}`);
        return;
      }

      this.dellLocalStore();

      localStorage.setItem('hbtw_gestora', String(gestora));
      localStorage.setItem('hbtw_route_origen', item);

      idConcepto = idConcepto.toString();
      if (idConcepto === "0" && gestora === 0) {
        this.activeIdParent(padreId, Number(idConcepto), id);
        return;
      }
      this.isLoading.set(false);
      this.conceptsArr.set(this.generalService.conceptoStorage);
      this.buildTitle(concept);

      const conceptSelect: DataConceptsStruct[] = this.conceptsArr().filter(resp => resp.pk == id);

      if (idConcepto !== "0" || gestora! > 0) {
        this.changSidenav.toggle();
      }

      if (conceptSelect[0].formulario > 1) {
        if (conceptSelect[0].formulario === 5 || conceptSelect[0].formulario === 4 || conceptSelect[0].formulario === 3 ||
          conceptSelect[0].formulario === 6 || conceptSelect[0].formulario === 7 || conceptSelect[0].formulario === 8 ||
          conceptSelect[0].formulario === 13 || conceptSelect[0].formulario === 14 || conceptSelect[0].formulario === 16 ||
          conceptSelect[0].formulario === 17 || conceptSelect[0].formulario === 12) {
          this.router.navigate(['/dashboard/' + item, idConcepto, conceptSelect[0].formulario]);
          return;
        }
        this.router.navigate(['/dashboard/' + item]);
        return;
      }
      this.router.navigate(['/dashboard/' + item, idConcepto, conceptSelect[0].formulario]);
  }
}
