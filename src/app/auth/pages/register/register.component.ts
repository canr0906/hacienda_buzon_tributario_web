import { Component, inject, signal } from '@angular/core';
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
    TaxpayerRecurrentcontribComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  step = signal(0);

  private fb = inject(FormBuilder);
  public myFormReg: FormGroup = this.fb.group({
    tipoPersona: ['F',[Validators.required]],
    nombre: ['',[Validators.required]],
    primerApellido: ['', [Validators.required]],
    segundoApellido: ['', [Validators.required]],
    razonSocial: [{value: '', disabled: true},[Validators.required]],
    rfc: ['XAXX010101000', [Validators.required ]],//Validators.pattern(this.validatosService.rfcFisica)]],
    curp: [''],
    domicilio: this.fb.group({
      calle: ['', [Validators.required]],
      numeroExterior: ['', [Validators.required]],
      numeroInterior: [],
      colonia: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required ]],//Validators.pattern(this.validatosService.exprCp)]],
      estados: [{value: '17', disabled: true},[Validators.required, Validators.min(1)]],
      municipio: ['',[Validators.required, Validators.min(1)]],
      observaciones: []
    })
  });

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

  }
}
