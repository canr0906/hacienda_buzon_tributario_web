import { Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import {SidenavComponent} from '@shared/components/sidenav/sidenav.component';
import {ToolbarComponent} from '@shared/components/toolbar/toolbar.component';
import {SnackBarComponent} from '@shared/components/snack-bar/snack-bar.component'

import {MatSidenavModule} from '@angular/material/sidenav';
import { PortalMenu } from '@dashboard/interfaces/portal-menu.interfaz';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataConceptsStruct } from '@shared/interfaces/concepts-response-struct.interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
  public receiveNameConcept = signal<string>('');

  /* SE ENVIA AL COMPONENTE TOOLBAR */
  public senNameDep = signal<string>('SECRETARÍA DE HACIENDA Y CRÉDITO PÚBLICO');

  /* ENVIA UN VALOR ALEATORIO MAYOR A 0 PARA INDICAR QUE SE IRA AL HOME, SE ENVIARA AL SIDENAV QUE LIMPIARA VARIABLES AL RECIBIR */
  public sendActEraseLocalStor: Subject<boolean> = new Subject<boolean>();

  public controlView = signal<boolean>(false);

  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading = signal<boolean>(false);

  /* RECIBE DEL SERVICE-MENU.COMPONENT PARA VISUALIZAR O NO LAS OPCIONES DE TOOLBAR */
  public showoptions = signal<boolean>(true);

  private destroyed = new Subject<void>();
  /* CONTROLAR LA RESOLUCION DE LA PANTALLA */
  public sizeDisplay = signal<string>('');
  /* CONTROLAR EL TIPO DE RESOLUCIONES */
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);
  /* INYECCION DE LA DEPENDECIA QUE ESCUCHA  LA RESOLUCION ACTUAL */
  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.mediaQuery();
  }

  ngOnDestroy(): void {
    this.valCardSubjectEmitt.unsubscribe();
    this.sendActionSidenav.unsubscribe();
    this.sendActEraseLocalStor.unsubscribe();

    this.destroyed.next();
    this.destroyed.unsubscribe();
  }

  /* RECIBE UN OBJETO DE LA DEPENDENCIA SELECIONADA DEL COMPONENTE SERVICE-MENU.COMPONENT */
  reciveValCard(valCard: DataConceptsStruct[]){//PortalMenu[]) {
    this.valCardSubjectEmitt.next(valCard);
    this.senNameDep.set(valCard[0].titulo);
  }

  /* NOTA: RECIBE NOMBRE DEL CONCEPTO CELECCIONADO EN SIDENAV */
  reciveNameConcept(nameConcep: string) {
    this.receiveNameConcept.set(' - [ ' + nameConcep + ' ]');
    this.controlView.set(true);
  }

  redirectHome(event: boolean): void {
    this.controlView.set(false);
    this.senNameDep.set('SECRETARÍA DE HACIENDA Y CRÉDITO PÚBLICO');
    this.receiveNameConcept.set('');
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

  public mediaQuery() {

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.sizeDisplay.set(this.displayNameMap.get(query) ?? 'Unknown');
          }
        }
      });


  }

}
