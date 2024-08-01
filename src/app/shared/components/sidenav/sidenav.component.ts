import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';

import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import { DataConceptsStruct } from '@shared/interfaces/concepts-response-struct.interface';
import { Subject } from 'rxjs';
import { ServiciosHaciendaPortalService } from '@dashboard/services/servicios-hacienda-portal.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { StorageDataStruct } from '@shared/interfaces/localstorage/storage-data-struct.interfaz';
import { VehicleDataResponseStruct } from '@dashboard/interfaces/smyt/vehicle-data-response-struct';
import { VehicleDataRequestStruct } from '@dashboard/interfaces/smyt/vehicle-data-request-struct';
import { PolizaDataResponse } from '@dashboard/interfaces/smyt/poliza-data-response.interfaz';
import { DataDecrypt } from '@shared/classes/data-decrypt';
import { DataEncrypt } from '@shared/classes/data-encrypt';
import { DataServiceGeneralRequest } from '@dashboard/interfaces/data-service-general-request.interfaz';


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

  /* VARIABLE QUE CONTROLA EL LOCALSTORAGE GENERAL */
  private localStorageControl: StorageDataStruct = {} as StorageDataStruct
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
      this.conceptsArr.set([]);
      //this.changSidenav.toggle();
      this.showMessage.set(true);
      this.showBack.set(false);
    })
  }

  ngAfterViewInit(): void {
    /*
      NOTA: OBSERVACLE EN ESPERA DE VALORES DE DEPENDENCIA SELECCIONADA,
      VALORES QUE SON ENVIADOS POR DEPENDENCIAS-CARDS
    */
    this.valDependenciaCard.subscribe(resp => {
      //this.processChangeOnView(resp[0].padreId);
      this.localStorageControl.hbtw_idParent = []
      this.activeIdParent(resp[0].pk, 0, resp[0].pk);
    });
    if(!!localStorage.getItem('hbtw_general')) {
      this.localStorageControl = new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt() as StorageDataStruct;
    }
  }

  ngOnDestroy(): void {
    this.reciveActionSideNav.unsubscribe();
    //this.eraseLocalStor.unsubscribe();
    this.valDependenciaCard.unsubscribe();
  }

  activeIdParent(padreId: number, idConcepto: number, id: number) {
    if (!!this.localStorageControl.hbtw_idParent) {
      this.localStorageControl.hbtw_idParent.push({ padreId: padreId });
    } else {
      this.localStorageControl.hbtw_idParent = [{padreId:padreId}]
    }

    new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general');

    this.buildMenu((idConcepto > 0) ? idConcepto : id);
    if (this.localStorageControl.hbtw_idParent.length > 1)
      this.showBack.set(true);

    return;
  }

  buildMenu(padreId: number) {
    this.isLoading.set(true);
    if (!!this.localStorageControl.hbtw_idParent){//localStorage.getItem('hbtw_idParent') || JSON.parse(localStorage.getItem('hbtw_idParent')!).length <= 1) {
      this.showBack.set(false);
    }
    this.generalService.requestConceptos(padreId)
      .subscribe(conceptos => {
        if (conceptos !== undefined) {
          const result = conceptos.filter(resp => resp.rol == 0);
          if (result.length > 0) {
            this.generalService.conceptoStorage = result;
            this.showMessage.set(false);
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
        this.isLoading.set(false);
        this.conceptsArr.set([]);
      });


  }

  backMenu() {
    if (!!this.localStorageControl.hbtw_idParent) {
      this.localStorageControl.hbtw_contribuyente = {} as VehicleDataResponseStruct
      const idControl = this.localStorageControl.hbtw_idParent?.slice(-2)[0].padreId// idParent[idParent.length - 2].padreId;
      this.localStorageControl.hbtw_idParent?.pop();
      if (!!!this.localStorageControl.hbtw_idParent) {
        this.localStorageControl.hbtw_idParent = [];
        this.showBack.set(false);
      }

      new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general');

      this.buildMenu(idControl!);
      this.router.navigate(['/dashboard/portal-hacienda-servicios']);
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
    if (!!this.localStorageControl.hbtw_contribuyente_only)
      this.localStorageControl.hbtw_contribuyente_only = "";
    if (!!this.localStorageControl.hbtw_vehicle_data)
      this.localStorageControl.hbtw_vehicle_data = {} as VehicleDataRequestStruct;
    if (!!this.localStorageControl.hbtw_vehicle_data_adicional)
      this.localStorageControl.hbtw_vehicle_data_adicional = "";
    if (!!this.localStorageControl.hbtw_datos_poliza)
      this.localStorageControl.hbtw_datos_poliza = {} as PolizaDataResponse;
    if (!!this.localStorageControl.hbtw_datos_cobro)
      this.localStorageControl.hbtw_datos_cobro = {} as DataServiceGeneralRequest;

    new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general');

  }

  buildTitle(concept: string) {
    this.localStorageControl.hbtw_concept = concept;
    new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general');
    this.nameConcept.emit(concept);
  }

  actionList(item: string, concept: string, id: number, idConcepto: string | number, padreId: number, gestora?: number) {
    console.log(item + '-' + concept + '-' + id + '-' + idConcepto + '-' + padreId + '-' + gestora)
    /*
      NOTA:  DETERMINA SI EL CONCEPTO PERMITE AGREGAR MAS CONCEPTOS DE SU SECCION
    */
      if (Number(gestora) > 0) {
        if (this.generalService.conceptoStorage.filter(resp => resp.idConcepto === Number(idConcepto) && resp.combinable == 1).length == 0) {
          !!this.localStorageControl.hbtw_contribuyente?this.localStorageControl.hbtw_contribuyente = {} as VehicleDataResponseStruct : '';
        }
      }

      this.localStorageControl.hbtw_gestora = String(gestora);
      this.localStorageControl.hbtw_route_origen = item;

      new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general');

      if (new RegExp('^(?:https?):\/\/?').test(item)) {
        window.open(`${item}`);
        return;
      }

      this.dellLocalStore();

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
