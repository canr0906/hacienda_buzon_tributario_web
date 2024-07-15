import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'hacienda-taxpayer-recurrentcontrib',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './taxpayer-recurrentcontrib.component.html',
  styleUrl: './taxpayer-recurrentcontrib.component.css'
})
export class TaxpayerRecurrentcontribComponent {

  private fb = inject(FormBuilder);
  public formTaxPayRecurrent: FormGroup = this.fb.group({
    smyt: this.fb.group({
      refrendo: false,
      licencia: false,
      numeroserie: [{value:'',disable:true},[Validators.required]],
      confirmserie: [{value:'',disable:true},[Validators.required]]
    }),
    impuestos: this.fb.group({
      erogaciones:false,
      hospedaje:false,
      balnearios:false,
      demasias:false,
      isan:false
    })
  });

}
