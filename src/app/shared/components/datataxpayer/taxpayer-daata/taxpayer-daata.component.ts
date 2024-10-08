import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';

import { RouterModule  } from '@angular/router';


import { GeneralService } from '@shared/services/general.service';
import { SnackBarComponent } from '../../snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { listaMunicipiosStruct } from '@shared/interfaces/municipios-response-struct.interfaz';
import { MatInputModule } from '@angular/material/input';

import {GenerateMessage} from '@shared/classes/generate-message.class'
import { UserStruct } from '@auth/interfaces/user-struct.interface';
import { ValidatorsService } from '@shared/services/validators.service';

@Component({
  selector: 'hacienda-taxpayer-daata',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
    MatAccordion,
    MatExpansionModule,
    MatInputModule
  ],
  templateUrl: './taxpayer-daata.component.html',
  styleUrl: './taxpayer-daata.component.css'
})
export class TaxpayerDaataComponent implements OnInit {

  public tipoPersona = signal<string>('F');

  private generalService = inject(GeneralService);
  private validatorService = inject(ValidatorsService);

  private _snackBar = inject(MatSnackBar);

  public arrMunicipios: listaMunicipiosStruct[] = [];
  public arrEstados: listaMunicipiosStruct[] = [];

  public sessionStor!:UserStruct;

  private fb = inject(FormBuilder);
  public formTaxPay: FormGroup = this.fb.group({
    tipoPersona: ['F',[Validators.required]],
    nombre: ['',[Validators.required]],
    primerApellido: ['', [Validators.required]],
    segundoApellido: ['', [Validators.required]],
    razonSocial: [{value: '', disabled: true},[Validators.required]],
    rfc: ['XAXX010101000', [Validators.required, Validators.pattern(this.validatorService.rfcFisica)]],
    curp: [''],
    domicilio: this.fb.group({
      calle: ['', [Validators.required]],
      numeroExterior: ['', [Validators.required]],
      numeroInterior: [],
      colonia: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required]],//, Validators.pattern(this.validatosService.exprCp)]],
      estados: [{value: '', disabled: false},[Validators.required, Validators.min(1)]],
      municipio: ['',[Validators.required, Validators.min(1)]],
      observaciones: []
    })
  }/*,
  {
    validators:[this.validatosService.validateDataInput('nombre',1,'contribuyente'),
      this.validatosService.validateDataInput('primerApellido',2,'contribuyente'),
      this.validatosService.validateDataInput('segundoApellido',3,'contribuyente'),
    ],
  }*/
  );

  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  ngOnInit(): void {
    /* OBTIENE LISTA DE ENTIDADES FEDERATIVAS */
      this.generalService.getEntidadesFederativas().subscribe(resp => {
        if(!resp){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar al CAT');
        } else {
          this.arrEstados = resp?.data;
        }
      });
  }

  /* EVALUA EL VALOR DEL CAMPO TIPO DE PERSONA PARA DESHABILITAR CAMPOS CUNADO TIPO DE PERSONA ES MORAL Y HABILITA OTROS */
  changeRadioTP(evento:string): void {
    this.tipoPersona.set(evento);
    if (evento==='M') {
      this.disabledEnabledElement(['nombre','primerApellido','segundoApellido','curp'],['razonSocial']);
      this.formTaxPay.get('rfc')?.setValue('');
      this.formTaxPay.get('rfc')?.clearValidators();
      this.formTaxPay.get('rfc')?.setValidators([Validators.pattern(this.validatorService.rfcMoral)]);
      this.formTaxPay.updateValueAndValidity();
      return;
    }
    this.disabledEnabledElement(['razonSocial'], ['nombre','primerApellido','segundoApellido','curp']);
    this.formTaxPay.get('razonSocial')?.enable();
    this.formTaxPay.get('rfc')?.clearValidators();
    this.formTaxPay.get('rfc')?.setValue('XAXX010101000');
    this.formTaxPay.get('rfc')?.setValidators([Validators.pattern(this.validatorService.rfcFisica)]);
    this.formTaxPay.updateValueAndValidity();
    return;
  }
  /* HABILITA O DESHABILITA CAMPOS */
  disabledEnabledElement(element:string[],enabledElement:string[]) {
    element.forEach(element => {
      this.formTaxPay.get(element)?.disable();
    });
    enabledElement.forEach(element => {
      this.formTaxPay.get(element)?.enable();
    });
  }

  /*
      SE DISPARA AL SELECCIONAR UN ESTADO
  */
  changeEstado(event: string): void {
    this.generalService.getMunicipios(Number(event))
      .subscribe(resp => {
        if(!resp || resp.data.length==0){
          this.openSnackBar('Problema con el API-SERVER, favor de contactar a Servicio Técnico ');
        } else {
          this.arrMunicipios = resp.data;
        }
      });
  }

  getMessage(idMssg:number, nameField:string) {
      let generateMessage = new GenerateMessage(this.validatorService);
      return generateMessage.getMessage(this.formTaxPay,idMssg, nameField);
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,duration: 5500,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
    });
  }

}


