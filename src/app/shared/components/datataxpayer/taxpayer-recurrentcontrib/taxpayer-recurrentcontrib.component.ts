import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
      numeroserie: [{value:'',disabled:true},[Validators.required]],
      confirmserie: [{value:'',disabled:true},[Validators.required]]
    }),
    impuestos: this.fb.group({
      erogaciones:false,
      hospedaje:false,
      balnearios:false,
      demasias:false,
      isan:false
    })
  });

  get refrendo() {
    return this.formTaxPayRecurrent.get('smyt')?.get('refrendo') as FormArray;
  }

  checherRefrendo(event:boolean){
    console.log(this.formTaxPayRecurrent)
    if(event) {
      this.formTaxPayRecurrent.get('smyt')?.get('numeroserie')?.enable();
      this.formTaxPayRecurrent.get('smyt')?.get('confirmserie')?.enable();
      return;
    }
    this.formTaxPayRecurrent.get('smyt')?.get('numeroserie')?.disable();
    this.formTaxPayRecurrent.get('smyt')?.get('confirmserie')?.disable();
    return;
  }

}
