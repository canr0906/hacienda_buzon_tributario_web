import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnInit, signal } from '@angular/core';

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
import { Concepto } from '@dashboard/interfaces/smyt/vehicle-data-response-struct';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '@auth/services/auth-service.service';
import Swal from 'sweetalert2';
import { ValidateLogin } from '@shared/classes/validate-login';


@Component({
  selector: 'app-tabla-calculo-conceptos',
  standalone: true,
  imports: [
    CommonModule,
    LoadSpinnerComponent,
    SegmentTextPipe,
    ReactiveFormsModule,
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
export class TablaCalculoConceptosComponent implements OnInit{

  /* CONTROLA EL NOMBRE DE LOS ATRIBUTOS DEL OBJETO OBTENIDO */
  public displayedColumns  = signal<string[]>(['descripcion', 'ejercicioFiscal', 'importe', 'cantidad', 'subtotal']);
  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading         = signal<boolean>(false);
  /* CONTROLA EL VALOR RESULTADO DE LA CONSULTA */
  public total             = signal<number>(0);
  public tipoFormEdit      = signal<boolean>(false);
  public tipoFormEdit_hoja = signal<boolean>(false);
  /* VARIABLE QUE CONTROLA EL LOCALSTORAGE GENERAL */
  private localStorageControl: StorageDataStruct = {} as StorageDataStruct
  private listErrors                             = ListErrors;
  /* Variable en donde se almacena la consulta y que cumpla con la estructura CONCEPTO */
  public conceptos: Concepto[] = [];
  private router               = inject(Router);
  private activatedRoute       = inject(ActivatedRoute);
  private authService          = inject(AuthServiceService);
  private fb                   = inject(FormBuilder)

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

    /* INICIO:
              METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN
              CHECAR SI ESTA VALIDACION SE PUEDE LLEVAR A UNA CLASE O UN GUARD
    */
    new ValidateLogin(this.authService).validateSession()
      .then((resp:any)=> {
        console.log(resp)
        console.log(!!resp.success)
      })
      .catch(err=>{
        console.log(err)
      })
    /* FIN */
  }

  datosContribuyente(): void { }

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
