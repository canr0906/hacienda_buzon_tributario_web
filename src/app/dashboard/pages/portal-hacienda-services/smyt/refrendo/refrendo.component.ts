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

  public isAuthenticated = signal<boolean>(false);

  /* ALMACENA LAS PLACAS ASOCIADAS A LAS SERIES ALMACENADAS EN LOCALSTORAGE. SE LE PASAN A VEHICLE-DATA.COMPONENT */
  public arrDataVehicle = signal<VehicleBySerie[]>([])

  @ViewChild(VehicleDataComponent)
  private childComponent!: VehicleDataComponent;

  private listErrors = ListErrors;

  ngOnInit(): void {
    /* SI EXISTE TOKEN SE ASUME QUE ES UN USUARIO REGISTRADO */
    this.conceptTitle.set(localStorage.getItem('hbtw_concept_admin')!);
    if(!!localStorage.getItem('hbtw_token')) {
      /* METODO ASINCRONO QUE SESENCRIPTA DATOS DE USUARIO Y TOKEN */
      this.authService.checkAuthStatusAsync()
      .then(result => {
        if(result) {
          /* OBSERVABLE QUE RENUEVA EL TOKEN */
          this.authService.checkAuthStatus()
            .subscribe({
              next:(resp) => {
                console.log(resp)
                if(resp) {
                  this.isAuthenticated.set(true);
                  /* METODO INTERNO PARA OBTENER DATOS DEL VEHICULO */
                  this.getVehicleData(this.authService.getToken());
                }
              },
              error: (message) => {
                this.isLoading.set(false);
                Swal.fire({
                  icon: "error",
                  title: "Error!!",
                  text: message
                }).then(()=>{
                  this.authService.logout();
                  this.router.navigateByUrl('/auth')
                });
              },
              complete: () => {}
            });
        } else {
          Swal.fire('Error', `Error ${this.listErrors[0].id}. Repórtelo al CAT`, 'error');
        }
      })
      .catch(error=>{
        Swal.fire('Error', error.message, 'error');
      })

      /**/
    }
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
              console.log(resp)
              this.arrDataVehicle.set(resp)
            },
            error: (message) => {
              this.isLoading.set(false);
              Swal.fire({
                icon: "error",
                title: "Error!!",
                text: message
              }).then(()=>{});
            },
            complete: () => {}
          })
      })
      .catch(error=>{
        Swal.fire('Error', error.message, 'error');
      })
  }

  onSubmit(): void {
    this.isLoading.set(true);
    if (this.myForm.invalid) {
      this.isLoading.set(false);
      return;
    }
    let reqData: StorageDataStruct = {} as StorageDataStruct;

    /*= {
      "placa": this.myForm.get('primary_form')?.get('placa')?.value,
      "tramite": 1,
      "obtenerContribuyente": true
    }*/

    reqData.hbtw_vehicle_data!.placa = this.myForm.get('primary_form')?.get('placa')?.value;
    reqData.hbtw_vehicle_data!.tramite = 1;
    reqData.hbtw_vehicle_data!.obtenerContribuyente = true;

    localStorage.setItem('hbtw_vehicle_data', JSON.stringify(reqData));
    //StorageDataStruct
    new DataEncrypt(reqData).dataEncript('hbtw_general')
      .then(resp => {
        this.smytService.validateVehicle(reqData.hbtw_vehicle_data!)
          .subscribe(resp => {
            if (resp?.success) {
              this.router.navigate(['/dashboard/tabla-conceptos',1]);
              return
            }
            this._snackBar.openFromComponent(SnackBarComponent, {
              data: resp?.data,
              duration: 3000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
            });

            this.isLoading.set(false);
          });
      }).catch(err =>{

      });

  }

}
