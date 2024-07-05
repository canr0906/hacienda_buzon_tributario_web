import { Component, inject, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

import {SidenavComponent} from '@shared/components/sidenav/sidenav.component';
import {ToolbarComponent} from '@shared/components/toolbar/toolbar.component';
import {SnackBarComponent} from '@shared/components/snack-bar/snack-bar.component'

import {MatSidenavModule} from '@angular/material/sidenav';
import { PortalMenu } from '@dashboard/interfaces/portal-menu.interfaz';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataConceptsStruct } from '@dashboard/interfaces/concepts-response-struct.interface';

@Component({
  selector: 'app-layout-dash',
  standalone: true,
  imports: [
    RouterModule,
    SidenavComponent,
    ToolbarComponent,
    MatSidenavModule
  ],
  templateUrl: './layout-dash.component.html',
  styleUrl: './layout-dash.component.css'
})
export class LayoutDashComponent implements OnDestroy {


  /* SE CREA OBSERVABLE QUE EMITIRA UN OBJETO DE LA DEPENDENCIA SELECCIONADA AL COMPONENTE SIDENAV   */
  public valCardSubjectEmitt: Subject<DataConceptsStruct[]> = new Subject();
  /* SE CREA OBSERVABLE QUE EMITIRA VALOR AL COMPONENTE SIDENAV   */
  public sendActionSidenav: Subject<boolean> = new Subject<boolean>();

  private _snackBar = inject(MatSnackBar);

  /* RECIBE EL NOMBRE DEL CONCEPTO DEL SIDENAV PARA SU MANIPULACION */
  public receiveNameConcept!: string;

  /* SE ENVIA AL COMPONENTE TOOLBAR */
  public senNameDep: string = 'SECRETARÍA DE HACIENDA Y CRÉDITO PÚBLICO';

  /* ENVIA UN VALOR ALEATORIO MAYOR A 0 PARA INDICAR QUE SE IRA AL HOME, SE ENVIARA AL SIDENAV QUE LIMPIARA VARIABLES AL RECIBIR */
  public sendActEraseLocalStor: Subject<boolean> = new Subject<boolean>();

  public controlView: boolean = false;

  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading: boolean = false;

  ngOnDestroy(): void {
    this.valCardSubjectEmitt.unsubscribe();
    this.sendActionSidenav.unsubscribe();
    this.sendActEraseLocalStor.unsubscribe();
  }

  /* RECIBE UN OBJETO DE LA DEPENDENCIA SELECIONADA DEL COMPONENTE SERVICE-MENU.COMPONENT */
  reciveValCard(valCard: DataConceptsStruct[]){//PortalMenu[]) {
    this.valCardSubjectEmitt.next(valCard);
    this.senNameDep = valCard[0].titulo;
  }

  /* NOTA: RECIBE NOMBRE DEL CONCEPTO CELECCIONADO EN SIDENAV */
  reciveNameConcept(nameConcep: string) {
    this.receiveNameConcept = ' - [ ' + nameConcep + ' ]';
    this.controlView = true;
  }

  redirectHome(event: boolean): void {
    this.controlView = false;
    this.senNameDep = 'SECRETARÍA DE HACIENDA Y CRÉDITO PÚBLICO';
    this.receiveNameConcept = '';
    //this.sendActEraseLocalStor = true;
    this.sendActEraseLocalStor.next(true);
  }

  /* RECIBE VALORES DEL COMPONENTE HIJO TOOLBAR AL PRECIONAR MENU*/
  actionOnSidenav(val: boolean): void {
    /* ACTUALIZA EL VALOR A EMITIR AL HIJO SIDENAV */
    this.sendActionSidenav.next(val);
    return;
  }

  /* NOTA: DISPARA ALERTAS - POSIBLEMENTE SE BORRE  */
  triggerAlert(event: string) {
    this.openSnackBar(event);
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 5500, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }

}
