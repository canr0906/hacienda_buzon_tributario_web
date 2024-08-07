import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';
import { ConcesionUSerStruct } from '@auth/interfaces/register-user/concesion-user-struct.interfaz';
import { EmailUSerStruct } from '@auth/interfaces/register-user/email-user-struct.interfaz';
import { PhoneUSerStruct } from '@auth/interfaces/register-user/phone-user-struct.interfaz';
import { RegisterlUser } from '@auth/interfaces/register-user/register-user-struct.interfaz';
import { TaxUSerStruct } from '@auth/interfaces/register-user/tax-user-struct.interfaz';
import { VehicleUSerStruct } from '@auth/interfaces/register-user/vehicle-user-struct.interfaz';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { DataDecrypt } from '@shared/classes/data-decrypt';
import { DataEncrypt } from '@shared/classes/data-encrypt';
import { ValidateLogin } from '@shared/classes/validate-login';

import {TaxpayerDaataComponent} from '@shared/components/datataxpayer/taxpayer-daata/taxpayer-daata.component';
import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import { StorageDataStruct } from '@shared/interfaces/localstorage/storage-data-struct.interfaz';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tax-payer-data',
  standalone: true,
  imports: [
    CommonModule,
    TaxpayerDaataComponent,
    LoadSpinnerComponent,
    ReactiveFormsModule,
    RouterModule,

    MatCardModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './tax-payer-data.component.html',
  styleUrl: './tax-payer-data.component.css'
})
export class TaxPayerDataComponent implements OnInit, AfterViewInit {

  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading      = signal<boolean>(false);
  public TaxDataControl = signal<boolean>(false);//signal<boolean>(true);
  private isAuthenticated   = signal<boolean>(false);

  /* VARIABLE QUE CONTENDRA LOS DATOS DEL USUARIO */
  private registerUserStruct: RegisterlUser           = {} as RegisterlUser;


  /* REFERENCIA AL COMPONENTE DE DATOS GENERALES DEL TAXPAYER */
  @ViewChild(TaxpayerDaataComponent)
  private childComponent!: TaxpayerDaataComponent;

  private fb = inject(FormBuilder);
  public myFormTaxPayer: FormGroup = this.fb.group({});

  private authService = inject(AuthServiceService);
  private router      = inject(Router);
  /* VARIABLE QUE CONTROLA EL LOCALSTORAGE GENERAL */
  private localStorageControl: StorageDataStruct = {} as StorageDataStruct

  ngOnInit(): void {

    new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt()
      .then(resp=>{
        this.localStorageControl = resp;
        /*if (resp.hbtw_gestora == '64') {
          this.TaxDataControl.set(false);
        }*/
      })
  }

  ngAfterViewInit(): void {
    /* SE AGREGANN AL FORMULARIO DE ESTE COMPONENTE LOS FORMULARIOS DE LOS COMPONENTES CORRESPONDIENTES */
    this.myFormTaxPayer.addControl('datos_generales',this.childComponent.formTaxPay);
    this.childComponent.formTaxPay.setParent(this.myFormTaxPayer);
  }

  changeTaxData(event: boolean) {
    if (event) {
      this.disabledEnabledElement(['razonSocial', 'rfc', 'curp', 'domicilio'], []);
      this.myFormTaxPayer.get('datos_generales')?.get('observaciones')?.enable();
      return;
    }
    this.disabledEnabledElement([], ['razonSocial', 'rfc', 'curp', 'domicilio']);
    return;
  }

  disabledEnabledElement(element: string[], enabledElement: string[]) {
    element.forEach(element => {
      this.myFormTaxPayer.get('datos_generales')?.get(element)?.disable();
    });
    enabledElement.forEach(element => {
      this.myFormTaxPayer.get('datos_generales')?.get(element)?.enable();
    });
  }

  generarPoliza(): void {
    this.isLoading.set(true);
    if ( this.myFormTaxPayer.invalid ) {
      this.myFormTaxPayer.markAllAsTouched();
      this.isLoading.set(false);
      return;
    }

    this.registerUserStruct = {} as RegisterlUser;


    /* DATOS GENERALES DEL USUARIO */
    this.registerUserStruct.tipo             = this.myFormTaxPayer.get('datos_generales')?.get('tipoPersona')?.value;
    this.registerUserStruct.nombre           = String(this.myFormTaxPayer.get('datos_generales')?.get('nombre')?.value).toUpperCase();
    this.registerUserStruct.apellido_paterno = String(this.myFormTaxPayer.get('datos_generales')?.get('primerApellido')?.value).toUpperCase();
    this.registerUserStruct.apellido_materno = String(this.myFormTaxPayer.get('datos_generales')?.get('segundoApellido')?.value).toUpperCase();
    this.registerUserStruct.rfc              = this.myFormTaxPayer.get('datos_generales')?.get('rfc')?.value;
    this.registerUserStruct.curp             = this.myFormTaxPayer.get('datos_generales')?.get('curp')?.value;
    if(this.myFormTaxPayer.get('datos_generales')?.get('rfc')?.valid) {
      this.registerUserStruct.tipo_identificacion = 1;
    } else {
      this.registerUserStruct.tipo_identificacion = 2;
    }
    this.registerUserStruct.password  = this.myFormTaxPayer.get('datos_pass')?.get('password')?.value;
    this.registerUserStruct.sistema   = 2;
    this.registerUserStruct.entidad   = this.myFormTaxPayer.get('datos_generales')?.get('domicilio')?.get('estados')?.value;
    this.registerUserStruct.municipio = this.myFormTaxPayer.get('datos_generales')?.get('domicilio')?.get('municipio')?.value;
    this.registerUserStruct.colonia   = String(this.myFormTaxPayer.get('datos_generales')?.get('domicilio')?.get('colonia')?.value).toUpperCase();
    this.registerUserStruct.cp        = this.myFormTaxPayer.get('datos_generales')?.get('domicilio')?.get('codigoPostal')?.value;
    this.registerUserStruct.calle     = String(this.myFormTaxPayer.get('datos_generales')?.get('domicilio')?.get('calle')?.value).toUpperCase();
    this.registerUserStruct.no_ext    = String(this.myFormTaxPayer.get('datos_generales')?.get('domicilio')?.get('numeroExterior')?.value).toUpperCase();
    this.registerUserStruct.no_int    = this.myFormTaxPayer.get('datos_generales')?.get('domicilio')?.get('numeroInterior')?.value??"";
    console.log(new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt())
    new DataEncrypt(this.registerUserStruct).dataEncript('hbtw_user')
      .then(resp=>{
        this.router.navigate(['dashboard/generar_poliza']);
      })
      .catch(err=>{
        this.isLoading.set(false);
        Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}`, allowOutsideClick:false})
          .then(()=>{
            this.router.navigate(['dashboard/portal-hacienda-servicios']);
          });
      })
  }

}
