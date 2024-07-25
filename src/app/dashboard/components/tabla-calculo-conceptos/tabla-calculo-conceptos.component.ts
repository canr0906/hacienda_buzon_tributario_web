import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import {SegmentTextPipe} from '@dashboard/pipes/segment-text.pipe';
import ListErrors from '@shared/data/errors.json';
import { Subject, takeUntil } from 'rxjs';

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

  /* CONTROLA EL NOMBRE DE LOS ATRIBUTOS DEL OBJETO OBTENIDO */
  public displayedColumns  = signal<string[]>(['descripcion', 'ejercicioFiscal', 'importe', 'cantidad', 'subtotal']);
  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading         = signal<boolean>(false);
  /* CONTROLA EL VALOR RESULTADO DE LA CONSULTA */
  public total             = signal<number>(0);
  public tipoFormEdit      = signal<boolean>(false);
  public tipoFormEdit_hoja = signal<boolean>(false);
  public isAuthenticated   = signal<boolean>(false);
  public tipoform          = signal<number>(0);
  public idConcepto        = signal<number>(0);
  /* NOTA: SE ALAMACENAN LOS CONCEPTOS RECIBIDOS POR LA URL */
    private arrConceptos   = signal<number[]>([]);
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

  constructor() {
    this.mediaQuery();
  }

  ngOnInit(): void {

    /* INICIO: METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN */
    new ValidateLogin(this.authService).validateSession()
      .then((resp:any)=> {
        console.log(resp)
        this.getCalculoPago(this.authService.getToken());
        /*if(resp.success) {
          this.isAuthenticated.set(true);
          this.getCalculoPago(this.authService.getToken());
        } else { }*/
      })
      .catch(err=>{
        console.log(err)
        this.isLoading.set(false);
        Swal.fire({
          icon: "error",
          title: `Error: ${err.statusCode}`,
          text: `${err.message}. Repórtelo al CAT e intente mas tarde`
        }).then(()=>{
          this.authService.logout();
          this.router.navigateByUrl('/auth')
        });
      })
    /* FIN */
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
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

                  localStorage.setItem('contribuyente_admin', JSON.stringify(result));
                  return;
                }
                Swal.fire({icon: "error", title: 'Error !!', text: 'EL TRÁMITE YA SE HA REALIZADO'})
                  .then(() => {
                    this.router.navigate(['dashboard']);
                  });
              },
              error: (error) => {
                 Swal.fire({icon: "error", title: `Error: ${error.statusCode}`, text: error.message})
                 .then(() => {
                    this.router.navigate(['dashboard/portal-hacienda-servicios']);
                  });
              }
            });
        } else {


          this.activatedRoute.params.subscribe(({ idConcepto, tipoForm }) => {
            this.tipoform.set(tipoForm);
            this.idConcepto.set(idConcepto);
            this.arrConceptos.update(() => [...this.arrConceptos(), idConcepto]);// set(idConcepto);
            const datos = JSON.parse(localStorage.getItem('datos_cobro_admin')!);
            switch (Number(this.tipoform)) {
              case 0: case 1: case 7:
                this.tipoFormEdit.set(true);
                if (this.tipoform() == 0) this.tipoFormEdit.set(false);
                //this.openSnackBar('La cantidad inicial es 1. Si desea agregar mas, cambie el valor en el campo cantidad.');
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
        Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}.`})
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

  datosContribuyente(): void { }

  consultConceptoPago(idConcepto: number, cantidad: number, monto?: number) {}

  /** SOAP Actualizar */
  consultConceptoPagoISAN(idConcepto: number) {}

  sendCant(val: any): void {}

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

}
