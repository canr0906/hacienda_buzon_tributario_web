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
import { GeneratePolicy } from '@dashboard/classes/generate-policy';
import { Poliza } from '@dashboard/interfaces/smyt/poliza-data-response.interfaz';
import { VehicleDataResponseStruct } from '@dashboard/interfaces/smyt/vehicle-data-response-struct';
import { DataDecrypt } from '@shared/classes/data-decrypt';
import { ValidateLogin } from '@shared/classes/validate-login';
import { GeneralService } from '@shared/services/general.service';
import Swal from 'sweetalert2';
import ListErrors from '@shared/data/errors.json';
import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';

@Component({
  selector: 'app-datos-poliza',
  standalone: true,
  imports: [
    CommonModule,
    LoadSpinnerComponent,
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

  private authService  = inject(AuthServiceService);
  private router = inject(Router);
  private serviciosGenerales = inject(GeneralService);

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
    this.isLoading.set(true);
    /* INICIO: METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN */
    /*new ValidateLogin(this.authService).validateSession()
      .then((resp:any)=> {
        console.log(resp)*/

        let instanceGenPolicy =  new GeneratePolicy(this.serviciosGenerales);
        //if(resp.success) {
          this.isAuthenticated.set(true);
          instanceGenPolicy.generatePolicyWithLogin()
            .then(resp =>{
              if(resp) {
                instanceGenPolicy.getState()
                  .then(resp => {
                    if(resp) {
                      instanceGenPolicy.getMunicipio()
                        .then(rep=> {
                          if(resp) {
                            instanceGenPolicy.getDataServices()
                              .then(resp => {
                                if(resp) {
                                  instanceGenPolicy.getTipoServicio()
                                    .then(resp => {
                                      if(resp) {
                                        instanceGenPolicy.generatePolyceGeneral()
                                          .then(resp => {
                                            if(!!resp) {
                                              this.isLoading.set(false);
                                              new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt()
                                                .then(resp => {
                                                  console.log(resp)
                                                  if(!!resp.hbtw_contribuyente) {
                                                    this.isLoading.set(false);
                                                    this.datosPoliza = resp.hbtw_datos_poliza.poliza;
                                                    this.myForm.reset({
                                                      numeroPoliza:resp.hbtw_datos_poliza.poliza.numeroPoliza, //this.datosPoliza.numeroPoliza,
                                                      lineaCaptura:resp.hbtw_datos_poliza.poliza.lineaCaptura,//this.datosPoliza.lineaCaptura,
                                                      monto: resp.hbtw_datos_poliza.poliza.total,//this.datosPoliza.total.toString(),
                                                      nombrePago: instanceGenPolicy.getLocalStorageUser().nombre + ' ' + instanceGenPolicy.getLocalStorageUser().apellido_paterno + ' ' + instanceGenPolicy.getLocalStorageUser().apellido_materno, //this.contribuyenteArr.data.contribuyente.nombre + ' ' + this.contribuyenteArr.data.contribuyente.primerApellido + ' ' + this.contribuyenteArr.data.contribuyente.segundoApellido,
                                                      lineaDetallePago: resp.hbtw_contribuyente.data.lineaDetalle,//this.contribuyenteArr.data.lineaDetalle,
                                                      pago2015: '2015',
                                                      banco: 'Bancomer',
                                                      extra: 'ECONOMIA-',
                                                      fecha: String(new Date().getDate()+4).toString()
                                                    })
                                                  } else {
                                                    Swal.fire({icon: "error", title: `Error: ${ListErrors[9].id}`, text: `No se encontraron datos locales para generar la Póliza. Repórtelo al CAT`, allowOutsideClick:false})
                                                      .then(()=>{
                                                        this.authService.logout();
                                                        this.router.navigateByUrl('/dashboar/portal-hacienda-servicios')
                                                      });
                                                  }
                                                })

                                            } else {
                                              Swal.fire({icon: "error", title: `Error: ${ListErrors[4].id}`, text: `${ListErrors[4].type}`, allowOutsideClick:false})
                                                .then(()=>{
                                                  this.authService.logout();
                                                  this.router.navigateByUrl('/auth')
                                                });
                                            }
                                          })
                                          .catch(err =>{
                                            this.isLoading.set(false);
                                            Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
                                              .then(()=>{
                                                this.authService.logout();
                                                this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                                              });
                                          })
                                      } else {
                                        Swal.fire({icon: "error", title: `Error: ${ListErrors[8].id}`, text: `${ListErrors[8].type}`, allowOutsideClick:false})
                                          .then(()=>{
                                            this.authService.logout();
                                            this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                                          });
                                      }
                                    })
                                    .catch(err => {
                                      this.isLoading.set(false);
                                      Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
                                        .then(()=>{
                                          this.authService.logout();
                                          this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                                        });
                                    })
                                } else {
                                  Swal.fire({icon: "error", title: `Error: ${ListErrors[7].id}`, text: `${ListErrors[7].type}`, allowOutsideClick:false})
                                    .then(()=>{
                                      this.authService.logout();
                                      this.router.navigateByUrl('/auth')
                                    });
                                }
                              })
                              .catch(err => {
                                this.isLoading.set(false);
                                Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
                                  .then(()=>{
                                    this.authService.logout();
                                    this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                                  });
                              })
                          } else {
                            Swal.fire({icon: "error", title: `Error: ${ListErrors[6].id}`, text: `${ListErrors[6].type}`, allowOutsideClick:false})
                            .then(()=>{
                              this.authService.logout();
                              this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                            });
                          }
                        })
                        .catch(err => {
                          this.isLoading.set(false);
                          Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
                            .then(()=>{
                              this.authService.logout();
                              this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                            });
                        })
                    }
                  })
                  .catch(err => {
                    //APLICAR
                  })
              }
            })
            .catch(err => {
              this.isLoading.set(false);
              Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
                .then(()=>{
                  this.authService.logout();
                  this.router.navigateByUrl('/auth')
                });
            });
        //}
        //this.getCalculoPago(this.authService.getToken());

      /*})
      .catch(err=>{
        this.isLoading.set(false);
        Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
          .then(()=>{
            this.authService.logout();
            this.router.navigateByUrl('/auth')
          });
      })*/
    /* FIN */

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
