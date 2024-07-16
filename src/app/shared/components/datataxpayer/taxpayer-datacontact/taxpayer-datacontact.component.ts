import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GenerateMessage } from '@shared/classes/generate-message.class';
import { GeneralService } from '@shared/services/general.service';

import TipoContacto from '@shared/data/tipo_contacto.json';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'hacienda-taxpayer-datacontact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAccordion,
    MatExpansionModule,
    MatSelectModule
  ],
  templateUrl: './taxpayer-datacontact.component.html',
  styleUrl: './taxpayer-datacontact.component.css'
})
export class TaxpayerDatacontactComponent implements OnInit {

  private generalService = inject(GeneralService);

  public stepContact = signal(0);

  public tipoContacto = signal(TipoContacto);

  private fb = inject(FormBuilder);
  public formTaxPayContact: FormGroup = this.fb.group({
    arrPhone: this.fb.group({
      arrPhoneType: this.fb.array([
        [1, [Validators.required, Validators.min(1)]]
      ]),
      arrPhoneNum: this.fb.array([
        ['', [Validators.required, Validators.pattern(this.generalService.expNoTel)]] /* validar numero telefonico */
      ]),
      arrPhoneExt: this.fb.array([
        ['']
      ])
    }),
    arrEmail: this.fb.group({
      arrEmailType: this.fb.array([
        ['',Validators.required]
      ]),
      arrEmailDir: this.fb.array([
        ['',Validators.required]
      ])
    })
  });


  get arrPhoneNum() {
    return this.formTaxPayContact.get('arrPhone')?.get('arrPhoneNum') as FormArray;
  }
  get arrPhoneType() {
    return this.formTaxPayContact.get('arrPhone')?.get('arrPhoneType') as FormArray;
  }
  get arrPhoneExt() {
    return this.formTaxPayContact.get('arrPhone')?.get('arrPhoneExt') as FormArray;
  }

  get arrEmailDir() {
    return this.formTaxPayContact.get('arrEmail')?.get('arrEmailDir') as FormArray;
  }

  get arrEmailType() {
    return this.formTaxPayContact.get('arrEmail')?.get('arrEmailType') as FormArray;
  }

  ngOnInit(): void {
    this.generalService
  }

  /* METODO ENCARGADO DE AGREGAR UN NUEVO REGISTRO AL FORMULARIO, RELACIONADO A DATOS TELEFONICOS */
  addNewPhone() {
    this.arrPhoneType.push(
       new FormControl('', [Validators.required,Validators.min(1)])
    );
    this.arrPhoneNum.push(
       new FormControl('', [Validators.required, Validators.pattern(this.generalService.expNoTel)])
    );
    this.arrPhoneExt.push(
      new FormControl('')
    )
  }
  /* METODO ENCARGADO DE REMOVER EL ULTIMO ELEMENTO DEL FORMULARIO, RELACIONADO A DATOS TELEFONICOS */
  removeArrPhone(): void {
    this.arrPhoneType.removeAt(this.arrPhoneType.length-1);
    this.arrPhoneNum.removeAt(this.arrPhoneNum.length-1);
    this.arrPhoneExt.removeAt(this.arrPhoneExt.length-1);
  }

  /* METODO ENCARGADO DE AGREGAR UN NUEVO REGISTRO AL FORMULARIO, RELACIONADO A DATOS DE EMAIL */
  addNewEmail() {
    this.arrEmailType.push(
       new FormControl('', [Validators.required])
    );
    this.arrEmailDir.push(
       new FormControl('', [Validators.required])
    );

  }
  /* METODO ENCARGADO DE REMOVER EL ULTIMO ELEMENTO DEL FORMULARIO, RELACIONADO A DATOS DE EMAIL */
  removeArrEmail(): void {
    this.arrEmailType.removeAt(this.arrEmailType.length-1);
    this.arrEmailDir.removeAt(this.arrEmailDir.length-1);
  }


  setStepContact(index: number) {
    this.stepContact.set(index);
  }

  getMessageTaxContact(idMssg: ValidationErrors | null | undefined, nameField: string){
    let messge: string = '';
    if(nameField=='arrPhoneNum') {
      this.arrPhoneNum.controls.forEach((val,key)=>{
        if(!!val.errors) {
          if(!!val.errors['required']) {
            messge = 'Este campo requerido';
          }else{
            messge = 'Formato incorrecto';
          }
        }
        //messge = '';
      })
    }
    /*if (!idMssg) {
      return '';
    }
    const errors = Object.keys(idMssg);
    if (errors.includes('required')) {
      return 'Este campo requerido';
    }
    if (errors.includes('min')) {
      return 'No se permite valor menor a 1';
    }
    if (errors.includes('max')) {
      return 'Para poder continuar seleccione NO';
    }
    if (errors.includes('pattern')) {
      return 'Formato incorrecto';
    }*/
    return messge;
  }
}
