import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { Poliza } from '@dashboard/interfaces/smyt/poliza-data-response.interfaz';
import { VehicleDataResponseStruct } from '@dashboard/interfaces/smyt/vehicle-data-response-struct';
import { DataDecrypt } from '@shared/classes/data-decrypt';
import { ValidateLogin } from '@shared/classes/validate-login';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-datos-poliza',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './datos-poliza.component.html',
  styles: ``
})
export class DatosPolizaComponent implements OnInit {

  private readonly url     = 'https://app.hacienda.morelos.gob.mx/recibo/poliza/imprimirPoliza?lineaCaptura=';

  public links             = ['Depósito Bancario', 'Tarjeta de Crédito o Débito'];
  public position          = signal<boolean[]>([true,false]);
  public links_icons       = signal<string[]>(['account_balance','credit_card']);
  private activeLink       = this.links[0];
  private isAuthenticated  = signal<boolean>(false);
  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading         = signal<boolean>(false);

  private authService      = inject(AuthServiceService);
  private router           = inject(Router);

  private contribuyenteArr = {} as VehicleDataResponseStruct;

  public datosPoliza:Poliza = {
    fechaVencimiento: '',
    numeroPoliza:     '',
    lineaCaptura:     '',
    total:            0,
  };

  @ViewChild('formPL', { read: ElementRef })
  private paytmForm!: ElementRef;

  private fb = inject(FormBuilder);
  public myForm = this.fb.group({
    numeroPoliza: [''],
    lineaCaptura: [''],
    monto: [''],
    nombrePago: [''],
    lineaDetallePago: [''],
    pago2015: ['2015'],
    banco: ['Bancomer'],
    extra: ['ECONOMIA-'],
    fecha: ['']
  });

  ngOnInit(): void {
    new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt()
      .then(resp => console.log(resp))

    /* INICIO: METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN */
    new ValidateLogin(this.authService).validateSession()
      .then((resp:any)=> {
        console.log(resp)
        if(resp.success) {
          this.isAuthenticated.set(true);
        }
        //this.getCalculoPago(this.authService.getToken());
      })
      .catch(err=>{
        this.isLoading.set(false);
        Swal.fire({
          icon: "error",
          title: `Error: ${err.statusCode}`,
          text: `${err.message}`
        }).then(()=>{
          this.authService.logout();
          this.router.navigateByUrl('/auth')
        });
      })
    /* FIN */

    this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente_admin')!);
    if (!this.contribuyenteArr.data.contribuyente) {
      this.contribuyenteArr = JSON.parse(localStorage.getItem('contribuyente_only_admin')!);
    }
    this.datosPoliza = JSON.parse(localStorage.getItem('datos_poliza_admin')!);
    this.myForm.reset({
      numeroPoliza:this.datosPoliza.numeroPoliza,
      lineaCaptura:this.datosPoliza.lineaCaptura,
      monto: this.datosPoliza.total.toString(),
      nombrePago: this.contribuyenteArr.data.contribuyente.nombre + ' ' + this.contribuyenteArr.data.contribuyente.primerApellido + ' ' + this.contribuyenteArr.data.contribuyente.segundoApellido,
      lineaDetallePago: this.contribuyenteArr.data.lineaDetalle,
      pago2015: '2015',
      banco: 'Bancomer',
      extra: 'ECONOMIA-',
      fecha: String(new Date().getDate()+4).toString()
    })
  }

  activeLinkFunct(link:number):void {
    this.activeLink = this.links[link];
    this.position()[link] = true;
    this.position()[(link>0)?0:1] = false;
  }

  getPoliza() {
    window.open(`${this.url}${this.datosPoliza.lineaCaptura}`);
  }

  portalPagoLinea() {
    this.paytmForm.nativeElement.submit();
  }
}
