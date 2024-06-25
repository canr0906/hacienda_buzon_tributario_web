import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';

import {TaxpayerDaataComponent} from '@shared/components/taxpayer-daata/taxpayer-daata.component';

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

    TaxpayerDaataComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  /*private fb = inject(FormBuilder);
  public myForm: FormGroup = this.fb.group({
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
  });*/

}
