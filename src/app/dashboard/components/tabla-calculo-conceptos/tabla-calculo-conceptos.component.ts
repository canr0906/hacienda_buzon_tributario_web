import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import {SegmentTextPipe} from '@dashboard/pipes/segment-text.pipe';
import ListErrors from '@shared/data/errors.json';
import { Subject, takeUntil, catchError, lastValueFrom, from } from 'rxjs';

import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { StorageDataStruct } from '@shared/interfaces/localstorage/storage-data-struct.interfaz';
import { DataDecrypt } from '@shared/classes/data-decrypt';
import { Concepto, VehicleDataResponseStruct } from '@dashboard/interfaces/smyt/vehicle-data-response-struct';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '@auth/services/auth-service.service';
import Swal from 'sweetalert2';
import { ValidateLogin } from '@shared/classes/validate-login';
import { SmytService } from '@dashboard/services/smyt/smyt.service';
import { ServiciosHaciendaPortalService } from '@dashboard/services/servicios-hacienda-portal.service';
import { DataEncrypt } from '@shared/classes/data-encrypt';
import { IsanCobros } from '@dashboard/interfaces/soap-data-struct.interfaz';
import { estadoVehiculo } from '@dashboard/interfaces/soap-estado-vehiculo-struct.interfaz';
import { ConvertXmlString } from '@dashboard/classes/convert-xml-string';
import { SnackBarComponent } from '@shared/components/snack-bar/snack-bar.component';
import { SoapServiciosConceptosDetalle } from '@dashboard/interfaces/soap-servicios_conceptos';


@Component({
  selector: 'app-tabla-calculo-conceptos',
  standalone: true,
  imports: [
    CommonModule,
    LoadSpinnerComponent,
    SegmentTextPipe,
    ReactiveFormsModule,
    RouterModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './tabla-calculo-conceptos.component.html',
  styleUrl: './tabla-calculo-conceptos.component.css'
})
export class TablaCalculoConceptosComponent implements OnInit, OnDestroy{

  /* Variables SOAP Actualizar o Borrar */
  private asJson!: IsanCobros;
  private asJsonEstadoVehiculo!: estadoVehiculo;
  //private asJsonIsan!: IsanCobros;
  private xmlSring: ConvertXmlString = new ConvertXmlString();

  /* CONTROLA EL NOMBRE DE LOS ATRIBUTOS DEL OBJETO OBTENIDO */
  public displayedColumns  = signal<string[]>(['descripcion', 'ejercicioFiscal', 'importe', 'cantidad', 'subtotal']);
  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading         = signal<boolean>(false);
  /* CONTROLA EL VALOR RESULTADO DE LA CONSULTA */
  public total             = signal<number>(0);
  public tipoFormEdit      = signal<boolean>(false);
  public tipoFormEdit_hoja = signal<boolean>(false);
  private isAuthenticated   = signal<boolean>(false);
  public tipoform          = signal<number>(0);
  public idConcepto        = signal<number>(0);
  /* NOTA: SE ALAMACENAN LOS CONCEPTOS RECIBIDOS POR LA URL */
  private arrConceptos     = signal<number[]>([]);
  /* VARIABLE QUE CONTROLA EL LOCALSTORAGE GENERAL */
  private localStorageControl: StorageDataStruct = {} as StorageDataStruct
  private listErrors                             = ListErrors;
  /* Variable en donde se almacena la consulta y que cumpla con la estructura CONCEPTO */
  public conceptos: Concepto[] = [];
  private router               = inject(Router);
  private activatedRoute       = inject(ActivatedRoute);
  private authService          = inject(AuthServiceService);
  private fb                   = inject(FormBuilder)
  private smytService          = inject(SmytService);
  private generalService       = inject(ServiciosHaciendaPortalService);


  /* INICIO: CONTROLA LA RESOLUCION DEL DISPOSITIVO EN EL QUE SE ESTA REALIZANDO LA CONSULTA */
  private destroyed = new Subject<void>();
  private breakpointObserver = inject(BreakpointObserver);
  public sizeDisplay!: string;
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);
  /* FIN */

  public newElementForm: FormControl = new FormControl('1', [Validators.required]);
  public formTableCal: FormGroup = this.fb.group({
    cantidadPago: this.fb.array([])
  });

  get cantidadPago() {
    return this.formTableCal.get('cantidadPago') as FormArray;
  }

  constructor(private _snackBar: MatSnackBar,) {
    this.mediaQuery();
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    /* INICIO: ESTA SECCION DESENCRIPTA DATOS PARA OPERARLOS DENTRO DEL COMPONENTE, EVALUAR SI SE PUEDE OBTIMIZAR YA QUE SE USA EN TODOS  */
    new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt()
    .then(resp => {
      this.localStorageControl = resp;
      /* INICIO: METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN */
      new ValidateLogin(this.authService).validateSession()
      .then((resp:any)=> {
        if(resp.success) {
          this.isAuthenticated.set(true);
        }
        this.getCalculoPago(this.authService.getToken());
      })
      .catch(err=>{
        this.isLoading.set(false);
        Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
          .then(()=>{
            this.authService.logout();
            this.router.navigateByUrl('/auth')
          });
      })
      /* FIN */
    })
    .catch(err=>{
      this.isLoading.set(false);
      Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
        .then(()=>{
          this.authService.logout();
          this.router.navigateByUrl('/auth')
        });
    })
    /* FIN */

  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
    this.activatedRoute.params.subscribe().unsubscribe();
  }

  getCalculoPago(token:string){

    this.smytService.getGeneralDataAsync()
      .then((resp:StorageDataStruct) => {
        if(!!resp.hbtw_vehicle_data) {
          this.smytService.getCalculoPagos(resp.hbtw_vehicle_data)
            .subscribe({
              next: (result) => {
                this.isLoading.set(false);
                if (result.success && result.data.conceptos.length > 0) {
                  this.conceptos = result.data.conceptos;
                  this.total.set(this.total() + result.data.total);
                  this.localStorageControl.hbtw_contribuyente = result;
                  new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general')
                      .then(response=> {
                        if(!!response) {
                          return;
                        }else{
                          throw {message:"No fue posible guardar la información de manera local",error:"Unauthorized",statusCode:412};
                        }
                      })
                      .catch(err=>{
                        Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}.`, allowOutsideClick:false})
                        .then(()=>{
                          this.authService.logout();
                          this.router.navigateByUrl('/auth')
                        });
                      });

                  return;
                }
                Swal.fire({icon: "error", title: 'Error !!', text: 'EL TRÁMITE YA SE HA REALIZADO', allowOutsideClick:false})
                  .then(() => {
                    this.router.navigate(['dashboard']);
                  });
              },
              error: (error) => {
                 Swal.fire({icon: "error", title: `Error: ${error.statusCode}`, text: error.message, allowOutsideClick:false})
                 .then(() => {
                    this.router.navigate(['dashboard/portal-hacienda-servicios']);
                  });
              }
            });
        } else {
          this.activatedRoute.params.subscribe(({ idConcepto, tipoForm }) => {
            this.tipoform.set(tipoForm);
            this.idConcepto.set(idConcepto);

            this.arrConceptos.update(values => [...values, idConcepto]);
            const datos = JSON.parse(localStorage.getItem('datos_cobro_admin')!);
            switch (Number(this.tipoform())) {
              case 0: case 1: case 7:
                this.tipoFormEdit.set(true);
                if (this.tipoform() == 0) this.tipoFormEdit.set(false);
                this.openSnackBar('La cantidad inicial es 1. Si desea agregar mas, cambie el valor en el campo cantidad.');
                this.consultConceptoPago(idConcepto, 1, this.tipoform());
                break;
              case 4:
                this.consultConceptoPagoISAN(this.idConcepto());
                break;
              case 5:
                Object.keys(datos).forEach(r => {
                  if (datos[r] > 0 && r !== 'cantidad') {
                    if (r === 'monto') {
                      this.consultConceptoPago(idConcepto, 1, datos[r]);//this.consultConceptoPago((r=='actualizacion' || r=='recargo'?651:idConcepto),1,datos[r]);
                    } else {
                      let control: boolean = true;
                      let id = setInterval(() => {
                        if (localStorage.getItem('contribuyente')) {
                          let contribuyente: VehicleDataResponseStruct = JSON.parse(localStorage.getItem('contribuyente')!);
                          contribuyente.data.conceptos.push(
                            {
                              id: 0,
                              clave: '0637',
                              cantidad: 1,
                              descripcion: (r == 'actualizacion' ? 'ACTUALIZACION ' : 'RECARGO ') + contribuyente.data.conceptos[0].descripcion,
                              ejercicioFiscal: contribuyente.data.conceptos[0].ejercicioFiscal, importe: datos[r],
                              importeUnitario: datos[r],
                            }
                          );
                          contribuyente.data.total += datos[r];
                          contribuyente.data.lineaDetalle += '0637' + '¬¬' + '1' + '¬' + (r == 'actualizacion' ? 'ACTUALIZACION ' : 'RECARGO ') + ' ' + contribuyente.data.conceptos[0].descripcion + '¬' + contribuyente.data.conceptos[0].ejercicioFiscal + '¬' + datos[r] + '¬' + '0637¬|';
                          localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
                          this.conceptos = contribuyente.data.conceptos;
                          this.total += datos[r];
                          clearInterval(id);
                        }
                      }, 150)
                    }
                  }
                });
                break;
              case 8:
                this.tipoFormEdit_hoja.set(true);
                /*this.displayedColumns.pop();
                this.displayedColumns.push('no_hojas');
                this.displayedColumns.push('subtotal');*/
                //this.openSnackBar('El No de Hojas es 1. Si desea agregar mas, cambie el valor en el campo No Hojas.');
                this.consultConceptoPago(idConcepto, 1, this.tipoform());
                break;
              case 13:
                this.consultConceptoPago(idConcepto, 1, this.tipoform());
                break;
              case 16: case 14: case 17: case 6: case 12: case 3:
                this.consultConceptoPago(idConcepto, 1, datos.monto);
                break;
              default:
                if (!this.tipoform) {
                  this.consultConceptoPago(idConcepto, 1, this.tipoform);
                }
                break;
            }
          });
          return;


        }
      })
      .catch(err =>{
        Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}.`, allowOutsideClick:false})
          .then(()=>{
            this.authService.logout();
            this.router.navigateByUrl('/auth')
          });
      });

    /*const dataVehicleLs: DatosTramite = JSON.parse(localStorage.getItem('vehicle_data_admin')!);
    this.smytService.getCalculoPagos(dataVehicleLs)
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);
          if (result.success && result.data.conceptos.length > 0) {
            this.conceptos = result.data.conceptos;
            this.total.set(this.total() + result.data.total);

            localStorage.setItem('contribuyente_admin', JSON.stringify(result));
            return;
          }
          this.openSnackBar('EL TRÁMITE YA SE HA REALIZADO');
          setTimeout(() => {
            this.router.navigate(['dashboard']);
          }, 2000)
        },
        error: (error) => {
          this.openSnackBar(error);
        }
      });*/
  }

  datosContribuyente(): void {
    if(this.isAuthenticated()) {
      Swal.fire({icon: "question", title: "Datos de la Póliza !!!", text: "Deseas que la poliza se genere con la información almacenado ?", showCancelButton: true, confirmButtonText: "Si", cancelButtonText: "No", allowOutsideClick:false})
        .then((result)=>{
          if(result.isConfirmed) {
            this.router.navigate(['dashboard/generar_poliza']);
          } else {
            this.router.navigate(['dashboard/datos-contribuyente']);
          }
        });
      return;
    }else{
      this.router.navigate(['dashboard/datos-contribuyente']);
    }
  }

  consultConceptoPago(idConcepto: number, cantidad: number, monto?: number) {
    monto = (monto == 0) ? 1 : monto;
    //Si esta definido el Local-Stor, y dependiendo de los conceptos se agregan los elementos al form
    if (!!this.localStorageControl.hbtw_contribuyente && (this.tipoFormEdit() || this.tipoFormEdit_hoja())) {
      Object.keys(this.localStorageControl.hbtw_contribuyente.data.conceptos).forEach((k, v) => {
        this.onAddElementForm();
      });
    } else {
      this.onAddElementForm();
    }


    this.isLoading.set(true);
    const datos = {
      "idConcepto": idConcepto,
      "monto": (monto) ? monto : null,
      "cantidad": cantidad
    };

    if (!!this.localStorageControl.hbtw_contribuyente) {
      if(this.localStorageControl.hbtw_contribuyente.data.conceptos.find(resp => resp.conceptoArea == idConcepto) !== undefined) {
        this.isLoading.set(false);
        return;
      }
    }

    this.smytService.otherCalculoPagos(datos)
      .subscribe({
        next: (resp) => {
          this.isLoading.set(false);
          if (resp.success && resp.data.conceptos.length > 0) {
            if (!!this.localStorageControl.hbtw_contribuyente){
              this.localStorageControl.hbtw_contribuyente!.data.conceptos.push(resp.data.conceptos[0]);
              this.localStorageControl.hbtw_contribuyente!.data.total = resp.data.total;
              this.localStorageControl.hbtw_contribuyente!.data.lineaDetalle = this.localStorageControl.hbtw_contribuyente!.data.lineaDetalle + resp.data.lineaDetalle;
              this.conceptos = this.localStorageControl.hbtw_contribuyente!.data.conceptos;
              new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general')
                .then(response => {
                  if(!response) {
                    throw {message:"No fue posible guardar la información de manera local",error:"Unauthorized",statusCode:412};
                  }
                })
                .catch(err=>{
                  Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}.`, allowOutsideClick:false})
                  .then(()=>{
                    this.authService.logout();
                    this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                  });
                });
              if (this.total() === 0) {
                this.total.set(this.localStorageControl.hbtw_contribuyente!.data.total);
                return;
              }
              this.total.set(this.localStorageControl.hbtw_contribuyente!.data.total + resp.data.total);
              return;
            }
            //this.conceptos = resp.data.conceptos;
            //localStorage.setItem('contribuyente_admin', JSON.stringify(resp));//this.conceptoPago));
            this.conceptos = resp.data.conceptos;
            this.localStorageControl.hbtw_contribuyente = resp;
            new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general')
                .then(response=> {
                  if(!!response) {
                    this.total.set( this.total() + resp.data.total);
                    if (this.generalService.conceptoStorage.filter(resp => resp.idConcepto === Number(idConcepto) && resp.combinable == 1).length > 0) {
                      setTimeout(() => {
                        this.openSnackBar('Para agregagar otro concepto, seleccionelo en el menu lateral');
                      }, 3000)
                    }
                  }else{
                    throw {message:"No fue posible guardar la información de manera local",error:"Unauthorized",statusCode:412};
                  }
                })
                .catch(err=>{
                  Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}.`, allowOutsideClick:false})
                  .then(()=>{
                    this.authService.logout();
                    this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                  });
                });
            return;
          }
          this.openSnackBar(resp.mensaje!);
          setTimeout(() => {
            this.router.navigate(['dashboard/portal-hacienda-servicios']);
          }, 2000)
        },
        error: (err) =>{
          Swal.fire({icon: "error", title: `Error !!`, text: `${err.message}.`, allowOutsideClick:false});
          this.isLoading.set(false);
        }
      });
  }

  onAddElementForm() {
    if (this.newElementForm.invalid) return;
    const newGame = this.newElementForm.value
    this.cantidadPago.push(
      this.fb.control(newGame)
    );

  }

  /** SOAP Actualizar */
  consultConceptoPagoISAN(idConcepto: number) {

    //const datos = JSON.parse(localStorage.getItem('datos_cobro')!);
    this.generalService.getDetalleCobroISAN(this.localStorageControl.hbtw_datos_cobro?.monto!, String(this.localStorageControl.hbtw_datos_cobro?.fechaVencimiento),927)
      .then(response => response.text())
      .then(xml => {
        this.isLoading.set(false);
        this.asJson = this.xmlSring.xmlStringToJson(xml.toString());
        let adeudos = this.asJson['soap:Envelope']['soap:Body']['ns2:obtenerRezagosActualizacionAdicionalesResponse'].adeudos;
        this.conceptos = [{
          id: 0,
          clave: String(adeudos['claveConcepto']['#text']),
          cantidad: 1,
          descripcion: String(adeudos['descripcion']['#text']),
          ejercicioFiscal: Number(adeudos['ejercicioFiscal']['#text']),
          importe: Number(adeudos['importe']['#text'])
        }];
        localStorage.setItem('contribuyente', JSON.stringify({ data: { total: Number(adeudos['total']['#text']), conceptos: this.conceptos, lineaDetalle: String(adeudos['lineaDetalle']['#text']) }, success: true }));//this.conceptoPago));
        this.total.set(this.total() + Number(adeudos['total']['#text']));
      }).catch(err => console.log(err));


  }

  sendNoHoja() {
    /** SOAP */
    this.total.set(0);
    this.isLoading.set(true);
    const totalHojas = this.cantidadPago.controls[0].value;
    let idConcepto = this.idConcepto();
    let monto = 0.0;
    this.generalService.getUma()
      .subscribe({
        next: (resp) => {
          let asJson: SoapServiciosConceptosDetalle;
          if (totalHojas == 1) {
            idConcepto = 4023;//1416;
          }
          if (totalHojas >= 2 && totalHojas <= 50) {
            idConcepto = 4021;
            monto = resp!.data.uma + ((totalHojas - 1) * (resp!.data.uma * 0.15));
          }
          if (totalHojas > 50) {
            idConcepto = 4022;
            monto = resp!.data.uma + ((resp!.data.uma * 0.15) * 49) + ((totalHojas - 50) * (resp!.data.uma * 0.15));
          }

          this.generalService.getConceptoDetalleRest(idConcepto, totalHojas)
            .subscribe({
              next: (response) => {
                let lineaDetalle: string = '';
                this.isLoading.set(false);
                this.conceptos = [{
                  id: 0,
                  clave: String(response?.data.conceptos[0].clave),
                  cantidad: 1,
                  descripcion: String(response?.data.conceptos[0].descripcion),
                  ejercicioFiscal: Number(response?.data.conceptos[0].ejercicioFiscal),
                  importe: response!.data.total
                }];
                this.localStorageControl.hbtw_contribuyente
                response?.data.lineaDetalle.split('¬').forEach((k, v) => {
                  if (v == 5) {
                    lineaDetalle += monto + '¬';
                  } else {
                    lineaDetalle += k + '¬';
                  }
                });
                this.localStorageControl.hbtw_contribuyente!.data.total = monto;
                this.localStorageControl.hbtw_contribuyente!.data.conceptos = this.conceptos;
                this.localStorageControl.hbtw_contribuyente!.data.lineaDetalle = lineaDetalle.slice(0, lineaDetalle.length - 1);
                this.localStorageControl.hbtw_contribuyente!.success = true;
                new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general')
                this.total.set(Number(monto));
              },
              error: (error) => {
                Swal.fire({icon: "error", title: `Error`, text: `Problemas en obtener Detalle Concepto. Repórtelo al CAT e intente mas tarde`, allowOutsideClick:false})
                .then(()=>{
                  this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
                });
              }
            });

        },
        error: (err) =>{
          Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}. Repórtelo al CAT e intente mas tarde`, allowOutsideClick:false})
            .then(()=>{
              this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
            });
        }
      })
  }

  /* SE INVOCA AL CAMBIAR EN LA TABLA EL CAMPO CANTIDAD O No DE HOJA */
  sendCant(val: any): void {
    if (this.tipoform() == 8) {
      this.sendNoHoja();
      return;
    }

    //let contribuyente: TopLevel = JSON.parse(localStorage.getItem('contribuyente')!);
    this.total.set(0);
    let lineDetalle: string = '';
    let keyDel: number = 0;
    let flagKey: boolean = false;
    this.localStorageControl.hbtw_contribuyente!.data.lineaDetalle = '';
    if (Number(this.cantidadPago.controls[val].value) == 0) {
      this.localStorageControl.hbtw_contribuyente!.data.conceptos.splice(val,1);
      //contribuyente.data.conceptos.splice(val, 1);
      this.localStorageControl.hbtw_contribuyente!.data.conceptos.forEach(({ importe }) => {
        this.total.set(this.total() + importe);
      });
      this.cantidadPago.removeAt(val);
      this.localStorageControl.hbtw_contribuyente!.data.total = this.total();
      this.conceptos = this.localStorageControl.hbtw_contribuyente!.data.conceptos;
      if (this.conceptos.length == 0) {
        this.router.navigate(['/pagos/dependencias']);
      }
      this.arrConceptos().splice(val, 1);//push(idConcepto);
      //localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
      return
    }
    this.isLoading.set(true);
    this.generalService.getConceptoDetalleRest(this.arrConceptos()[val], this.cantidadPago.controls[val].value)//this.idConcepto,this.cantidadPago.controls[key].value)
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
            return;
          }
          this.localStorageControl.hbtw_contribuyente!.data.conceptos[val].importe= resp.data.conceptos[0].importe;
          this.localStorageControl.hbtw_contribuyente!.data.conceptos[val].cantidad = resp.data.conceptos[0].cantidad;
          this.localStorageControl.hbtw_contribuyente!.data.lineaDetalle += resp.data.lineaDetalle;

          this.conceptos = this.localStorageControl.hbtw_contribuyente!.data.conceptos;
        },
        complete: () => {
          this.isLoading.set(false);
          this.localStorageControl.hbtw_contribuyente!.data.conceptos.forEach(({ importe }) => {
            this.total.set(this.total() + importe);
          });
          this.localStorageControl.hbtw_contribuyente!.data.total = this.total();
          new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general')
          .catch(err=>{
            Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}.`, allowOutsideClick:false})
              .then(()=>{
                this.authService.logout();
                this.router.navigateByUrl('/dashboard/portal-hacienda-servicios')
              });
          });
          //localStorage.setItem('contribuyente', JSON.stringify(contribuyente));
        }
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
            this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message, duration: 5500, panelClass: ["snack-notification"], horizontalPosition: "center", verticalPosition: "top",
    });
  }

}
