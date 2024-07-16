import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {TaxpayerDaataComponent} from '@shared/components/datataxpayer/taxpayer-daata/taxpayer-daata.component';
import {TaxpayerDatacontactComponent} from '@shared/components/datataxpayer/taxpayer-datacontact/taxpayer-datacontact.component';
import {TaxpayerRecurrentcontribComponent} from '@shared/components/datataxpayer/taxpayer-recurrentcontrib/taxpayer-recurrentcontrib.component';
import { TaxpayerPassComponent } from '@shared/components/datataxpayer/taxpayer-pass/taxpayer-pass.component';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { RegisterlUser } from '@auth/interfaces/register-user/register-user-struct.interfaz';
import { EmailUSerStruct } from '@auth/interfaces/register-user/email-user-struct.interfaz';
import { PhoneUSerStruct } from '@auth/interfaces/register-user/phone-user-struct.interfaz';
import { VehicleUSerStruct } from '@auth/interfaces/register-user/vehicle-user-struct.interfaz';
import { TaxUSerStruct } from '@auth/interfaces/register-user/tax-user-struct.interfaz';
import { ConcesionUSerStruct } from '@auth/interfaces/register-user/concesion-user-struct.interfaz';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatAccordion,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    /* DATOS DEL USUARIO */
    TaxpayerDaataComponent,
    TaxpayerDatacontactComponent,
    TaxpayerRecurrentcontribComponent,
    TaxpayerPassComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit {

  step = signal(0);
  private authService = inject(AuthServiceService);
  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading = signal<boolean>(false);
  /* VARIABLE QUE CONTENDRA LOS DATOS DEL USUARIO */
  private registerUserStruct: RegisterlUser           = {} as RegisterlUser;
  private emailUserStruct: EmailUSerStruct[]          = [];
  private phoneUserStruct: PhoneUSerStruct[]          = [];
  private taxUserStruct: TaxUSerStruct[]              = [];
  private vehicleUserStruct: VehicleUSerStruct[]      = [];
  private consesionUsersStruct: ConcesionUSerStruct[] = []

  /* REFERENCIA AL COMPONENTE DE DATOS GENERALES DEL TAXPAYER */
  @ViewChild(TaxpayerDaataComponent)
  private childComponent!: TaxpayerDaataComponent;

  /* REFERENCIA AL COMPONENTE DE DATOS DE CONTACTO TAXPAYER */
  @ViewChild(TaxpayerDatacontactComponent)
  private childComponentContact!: TaxpayerDatacontactComponent;

  /* REFERENCIA AL COMPONENTE DE DATOS DE CONTRIBUCIONES TAXPAYER */
  @ViewChild(TaxpayerRecurrentcontribComponent)
  private childComponentContrib!: TaxpayerRecurrentcontribComponent;

  /* REFERENCIA AL COMPONENTE DE DATOS DE PASSWORD TAXPAYER */
  @ViewChild(TaxpayerPassComponent)
  private childComponentPass!: TaxpayerPassComponent;

  private fb = inject(FormBuilder);
  public myFormReg: FormGroup = this.fb.group({});

  ngAfterViewInit(): void {
    setTimeout( () => {
      /* SE AGREGANN AL FORMULARIO DE ESTE COMPONENTE LOS FORMULARIOS DE LOS COMPONENTES CORRESPONDIENTES */
      this.myFormReg.addControl('datos_generales',this.childComponent.formTaxPay);
      this.childComponent.formTaxPay.setParent(this.myFormReg);

      this.myFormReg.addControl('datos_contacto',this.childComponentContact.formTaxPayContact);
      this.childComponentContact.formTaxPayContact.setParent(this.myFormReg);

      this.myFormReg.addControl('datos_contrib',this.childComponentContrib.formTaxPayRecurrent);
      this.childComponentContrib.formTaxPayRecurrent.setParent(this.myFormReg);

      this.myFormReg.addControl('datos_pass',this.childComponentPass.formTaxPayPass);
      this.childComponentPass.formTaxPayPass.setParent(this.myFormReg);
    });

    console.log(this.myFormReg)
  }


  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update(i => i + 1);
  }

  prevStep() {
    this.step.update(i => i - 1);
  }

  registerUser() {
    this.isLoading.set(true);
    if ( this.myFormReg.invalid ) {
      this.myFormReg.markAllAsTouched();
      this.isLoading.set(false);
      return;
    }
    /* DATOS GENERALES DEL USUARIO */
    this.registerUserStruct.tipo             = this.myFormReg.get('datos_generales')?.get('tipoPersona')?.value;
    this.registerUserStruct.nombre           = String(this.myFormReg.get('datos_generales')?.get('nombre')?.value).toUpperCase();
    this.registerUserStruct.apellido_paterno = String(this.myFormReg.get('datos_generales')?.get('primerApellido')?.value).toUpperCase();
    this.registerUserStruct.apellido_materno = String(this.myFormReg.get('datos_generales')?.get('segundoApellido')?.value).toUpperCase();
    this.registerUserStruct.rfc              = this.myFormReg.get('datos_generales')?.get('rfc')?.value;
    this.registerUserStruct.curp             = this.myFormReg.get('datos_generales')?.get('curp')?.value;
    if(this.myFormReg.get('datos_generales')?.get('rfc')?.valid) {
      this.registerUserStruct.tipo_identificacion = 1;
    } else {
      this.registerUserStruct.tipo_identificacion = 2;
    }
    this.registerUserStruct.password  = this.myFormReg.get('datos_pass')?.get('password')?.value;
    this.registerUserStruct.sistema   = 2;
    this.registerUserStruct.entidad   = this.myFormReg.get('datos_generales')?.get('domicilio')?.get('estados')?.value;
    this.registerUserStruct.municipio = this.myFormReg.get('datos_generales')?.get('domicilio')?.get('municipio')?.value;
    this.registerUserStruct.colonia   = String(this.myFormReg.get('datos_generales')?.get('domicilio')?.get('colonia')?.value).toUpperCase();
    this.registerUserStruct.cp        = this.myFormReg.get('datos_generales')?.get('domicilio')?.get('codigoPostal')?.value;
    this.registerUserStruct.calle     = String(this.myFormReg.get('datos_generales')?.get('domicilio')?.get('calle')?.value).toUpperCase();
    this.registerUserStruct.no_ext    = String(this.myFormReg.get('datos_generales')?.get('domicilio')?.get('numeroExterior')?.value).toUpperCase();
    this.registerUserStruct.no_int    = String(this.myFormReg.get('datos_generales')?.get('domicilio')?.get('numeroInterior')?.value).toUpperCase();

    /* DATOS DE EMAILS DEL USUARIO */
    this.childComponentContact.arrEmailDir.controls.forEach((val,key) =>{
      this.emailUserStruct.push(
        {
          direccion_correo: val.value,
          tipo_contacto: this.childComponentContact.arrEmailType.controls[key].value
        }
      );
    });

    /* DATOS DE PHONE DEL USUARIO */
    this.childComponentContact.arrPhoneNum.controls.forEach((val,key) =>{
      this.phoneUserStruct.push(
        {
          no_telefonico: val.value,
          tipo_contacto: this.childComponentContact.arrPhoneType.controls[key].value,
          extension: this.childComponentContact.arrPhoneExt.controls[key].value,
        }
      );
    });

    /* DATOS DE CONTRIBUCIONES DEL USUARIO */
    if(this.myFormReg.get('datos_contrib')?.get('smyt')?.get('licencia')?.value) {
      this.taxUserStruct.push({impuesto:1})
    }
    if(this.myFormReg.get('datos_contrib')?.get('smyt')?.get('refrendo')?.value){
      this.taxUserStruct.push({impuesto:2})
      this.vehicleUserStruct.push({
        serie: this.myFormReg.get('datos_contrib')?.get('smyt')?.get('numeroserie')?.value
      })
    }

    if(this.myFormReg.get('datos_contrib')?.get('impuestos')?.get('erogaciones')?.value){
      this.taxUserStruct.push({impuesto:3})
    }
    if(this.myFormReg.get('datos_contrib')?.get('impuestos')?.get('hospedaje')?.value){
      this.taxUserStruct.push({impuesto:4})
    }
    if(this.myFormReg.get('datos_contrib')?.get('impuestos')?.get('balnearios')?.value){
      this.taxUserStruct.push({impuesto:5})
    }
    if(this.myFormReg.get('datos_contrib')?.get('impuestos')?.get('demasias')?.value){
      this.taxUserStruct.push({impuesto:6})
    }
    if(this.myFormReg.get('datos_contrib')?.get('impuestos')?.get('isan')?.value){
      this.taxUserStruct.push({impuesto:7})
    }

    this.registerUserStruct.correosList = this.emailUserStruct;
    this.registerUserStruct.telefonosList = this.phoneUserStruct;
    this.registerUserStruct.impuestosList = this.taxUserStruct;
    this.registerUserStruct.vehiculosList = this.vehicleUserStruct;

    console.log(this.registerUserStruct);

    this.authService.registerTaxPayer()
  }
}
