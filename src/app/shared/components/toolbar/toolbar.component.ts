import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'hacienda-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {

 /* LAYOUT INDICA LA RESOLUCION */
 @Input()
  public viewResolution = signal<string>('');

  /* RECIBE EL NOMBRE DE LA DEPENDENCIA SELECCIONADA - ORIGEN PORTAL-HACIENDA-MENU */
  @Input()
  public receiveNameDep = signal<string>('TEXTO DE PRUEBA');

  /* EMITE VALOR BOOLEAN AL PADRE LAYOUT  */
  @Output()
  private openOrCloseSidenav = new EventEmitter<boolean>();

  /* NOTA: SE DIO CLICK EN HOME, NOTIFICAR AL PADRE PARA QUE SE LIMPIEN VARIABLES */
  @Output()
  private closeLocalStor = new EventEmitter<boolean>();

  /* CONTROLA EL VALOR DEL EVENTO AL DAR CLICK EN EL ICONO MENU */
  private controlElemnentMenu: boolean = false;

  /* MUESTRA LOS ICONOS DE MENU Y HOME */
  @Input()
  public showoptions = signal<boolean>(true);

  private servicesAuth = inject(AuthServiceService);
  private router = inject(Router);
  public existSessioStore = signal<boolean>(false);

  ngOnInit(): void {
    if(sessionStorage.getItem('hbtw_token')) {
      this.existSessioStore.set(true)
    }
  }


  redirectPagos(): void{
    this.closeLocalStor.emit(true);
  }

  sidenavAction(): void{
    this.controlElemnentMenu=!this.controlElemnentMenu
    /* EMITE VALORES BOOLEAN AL PADRE LAYOUT PAR INDICARLE QUE SE CLICKIO MENU */
    this.openOrCloseSidenav.emit(!this.controlElemnentMenu);
  }

  logout():void {
    console.log('Logout');
    this.servicesAuth.logout();
    this.router.navigateByUrl('auth');
  }
}
