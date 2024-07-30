import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { VehicleDataComponent } from '@dashboard/components/smyt/vehicle-data/vehicle-data.component';
import { SmytService } from '@dashboard/services/smyt/smyt.service';
import { DataDecrypt } from '@shared/classes/data-decrypt';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import { SnackBarComponent } from '@shared/components/snack-bar/snack-bar.component';
import Swal from 'sweetalert2';

import ListErrors from '@shared/data/errors.json';
import { VehicleBySerie } from '@dashboard/interfaces/smyt/vehicle-by-serie.interfaz';
import { DataEncrypt } from '@shared/classes/data-encrypt';
import { StorageDataStruct } from '@shared/interfaces/localstorage/storage-data-struct.interfaz';
import { ValidateLogin } from '@shared/classes/validate-login';
import { VehicleDataRequestStruct } from '@dashboard/interfaces/smyt/vehicle-data-request-struct';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LoadSpinnerComponent,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    VehicleDataComponent
  ],
  templateUrl: './refrendo.component.html',
  styleUrl: './refrendo.component.css'
})
export class RefrendoComponent implements OnInit,AfterContentInit {

  private fb           = inject(FormBuilder);
  private smytService  = inject(SmytService);
  private router       = inject(Router);
  private _snackBar    = inject(MatSnackBar);
  private authService  = inject(AuthServiceService);

  //Controla la visualización del Spinner
  public isLoading = signal<boolean>(false);
  public conceptTitle = signal<string>('');

  public myForm: FormGroup = this.fb.group({});

  public signalTrue = signal<boolean>(true);
  public signalFalse = signal<boolean>(false);
  /* VARIABLE QUE CONTROLA EL LOCALSTORAGE GENERAL */
  private localStorageControl: StorageDataStruct = {} as StorageDataStruct

  public isAuthenticated = signal<boolean>(false);

  /* ALMACENA LAS PLACAS ASOCIADAS A LAS SERIES ALMACENADAS EN LOCALSTORAGE. SE LE PASAN A VEHICLE-DATA.COMPONENT */
  public arrDataVehicle = signal<VehicleBySerie[]>([])

  @ViewChild(VehicleDataComponent)
  private childComponent!: VehicleDataComponent;

  private listErrors = ListErrors;

  ngOnInit(): void {
    /* INICIO: ESTA SECCION DESENCRIPTA DATOS PARA OPERARLOS DENTRO DEL COMPONENTE, EVALUAR SI SE PUEDE OBTIMIZAR YA QUE SE USA EN TODOS  */
    new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt()
      .then(resp => {
        this.localStorageControl = resp;
        /* INICIO: METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN */
        new ValidateLogin(this.authService).validateSession()
        .then((resp:any)=> {
          if(resp.success) {
            this.isAuthenticated.set(true);
            /* METODO INTERNO PARA OBTENER DATOS DEL VEHICULO */
            this.getVehicleData(this.authService.getToken());
          }
        })
        .catch(err=>{
          this.isLoading.set(false);
          Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}. Repórtelo al CAT e intente mas tarde`, allowOutsideClick:false})
            .then(()=>{
              this.authService.logout();
              this.router.navigateByUrl('/auth')
            });
        });
        /* FIN */
      })
      .catch(err=>{
        this.isLoading.set(false);
        Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
          .then(()=>{
            this.authService.logout();
            this.router.navigateByUrl('/auth')
          });
      });
      /* FIN */
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.myForm.addControl('primary_form', this.childComponent.myFormSmyt);
      this.childComponent.myFormSmyt.setParent(this.myForm);

      //this.myForm.markAllAsTouched();

      this.myForm.get('primary_form')!.get('placa')!.enable();
      this.myForm.get('primary_form')!.get('oficina')!.enable();
      this.myForm.get('primary_form')!.get('serie')!.enable();
    },200);
  }
  /* METODO ENCARGADO DE  OBTENER LAS SERIES VEHICULARES Y CONSULTAR SUS PLACAS*/
  getVehicleData(token:string) {
    this.smytService.getVehicleDataAsync()
      .then(response => {
        this.smytService.getVehicleData(response,token)
          .subscribe({
            next:(resp)=>{
              this.arrDataVehicle.set(resp)
            },
            error: (message) => {
              this.isLoading.set(false);
              Swal.fire({icon: "error", title: "Error!!", text: message, allowOutsideClick:false})
                .then(()=>{});
            },
            complete: () => {}
          })
      })
      .catch(err=>{
        Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
      })
  }

  onSubmit(): void {
    this.isLoading.set(true);
    if (this.myForm.invalid) {
      this.isLoading.set(false);
      return;
    }
    let reqData: VehicleDataRequestStruct = {} as VehicleDataRequestStruct;

    reqData.placa = this.myForm.get('primary_form')?.get('placa')?.value;
    reqData.tramite=1;
    reqData.obtenerContribuyente = this.isAuthenticated()?false:true


    this.localStorageControl.hbtw_vehicle_data = reqData;

    new DataEncrypt(this.localStorageControl).dataEncript('hbtw_general')
      .then(resp => {
        if(!!resp && resp) {
          this.smytService.validateVehicle(reqData)
            .subscribe({
              next:(resp) => {
                if (resp?.success) {
                  this.router.navigate(['/dashboard/tabla-conceptos',1]);
                  return
                }
                this._snackBar.openFromComponent(SnackBarComponent, {
                  data: resp?.data,
                  duration: 3000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
                });

                this.isLoading.set(false);
              },
              error: (err) => {
                Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
                this.isLoading.set(false);
              }
            });
        } else {
          throw {message: `Error ${this.listErrors[2].id}, seccion Refrendo. Repórtelo al CAT`, code: `${this.listErrors[2].id}`}
        }
      }).catch(err =>{
        Swal.fire({icon: "error", title: "Error!!", text: err.message, allowOutsideClick:false});
      });

  }

}
