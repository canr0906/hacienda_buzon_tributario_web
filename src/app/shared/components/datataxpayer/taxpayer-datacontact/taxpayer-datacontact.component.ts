import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GenerateMessage } from '@shared/classes/generate-message.class';
import { GeneralService } from '@shared/services/general.service';

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
    MatExpansionModule
  ],
  templateUrl: './taxpayer-datacontact.component.html',
  styleUrl: './taxpayer-datacontact.component.css'
})
export class TaxpayerDatacontactComponent {

  private generalService = inject(GeneralService);

  public stepContact = signal(0);

  private fb = inject(FormBuilder);
  public formTaxPayContact: FormGroup = this.fb.group({
    arrPhone: this.fb.group({
      arrPhoneType: this.fb.array([
        ['', Validators.required]
      ]),
      arrPhoneNum: this.fb.array([
        ['12345', Validators.required] /* validar numero telefonico */
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

  get arrEmailDir() {
    return this.formTaxPayContact.get('arrEmail')?.get('arrEmailDir') as FormArray;
  }

  get arrEmailType() {
    return this.formTaxPayContact.get('arrEmail')?.get('arrEmailType') as FormArray;
  }
  /* METODO ENCARGADO DE AGREGAR UN NUEVO REGISTRO AL FORMULARIO, RELACIONADO A DATOS TELEFONICOS */
  addNewPhone() {
    this.arrPhoneType.push(
       new FormControl('', [Validators.required])
    );
    this.arrPhoneNum.push(
       new FormControl('', [Validators.required])
    );

  }
  /* METODO ENCARGADO DE REMOVER EL ULTIMO ELEMENTO DEL FORMULARIO, RELACIONADO A DATOS TELEFONICOS */
  removeArrPhone(): void {
    this.arrPhoneType.removeAt(this.arrPhoneType.length-1);
    this.arrPhoneNum.removeAt(this.arrPhoneNum.length-1);
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
}
