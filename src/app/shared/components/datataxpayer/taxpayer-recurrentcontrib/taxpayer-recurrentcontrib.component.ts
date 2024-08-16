import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ValidatorsService } from '@shared/services/validators.service';

import MessagesList from '@shared/data/messages.json';
import { MessageStruct } from '@shared/interfaces/message-struct.interfaz';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { TaxpayerRecurrentrefrendoDialogComponent } from './taxpayer-recurrentrefrendo-dialog/taxpayer-recurrentrefrendo-dialog.component';

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

  readonly arrSeies = signal<string[]>([]);
  //readonly name = model('');
  readonly dialog = inject(MatDialog);

  private validatorService = inject(ValidatorsService);

  private listMessage = signal<MessageStruct[]>(MessagesList.smyt_alta_vehiculo)

  private fb = inject(FormBuilder);
  public formTaxPayRecurrent: FormGroup = this.fb.group({
    smyt: this.fb.group({
      refrendo: false,
      /*licencia: false,
      numeroserie: [{value:'',disabled:true},[Validators.required, Validators.pattern(this.validatorService.expSerieVehiculo)]],
      confirmserie: [{value:'',disabled:true},[Validators.required]]*/
    }/*,
    {
      validators: [
        this.validatorService.isFieldOneEqualFielTwo('numeroserie', 'confirmserie',4)
      ]
    }*/
    ),
    impuestos: this.fb.group({
      erogaciones:false,
      hospedaje:false,
      balnearios:false,
      demasias:false,
      //isan:false
    })
  });

  /*get refrendo() {
    return this.formTaxPayRecurrent.get('smyt')?.get('refrendo') as FormArray;
  }*/

    checarRefrendo(event:boolean){
      console.log(event);
    const dialogRef = this.dialog.open(TaxpayerRecurrentrefrendoDialogComponent,{width: '640px',disableClose: true});

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed::'+result);

    });
    /*if(event) {
      Swal.fire({
        title:"<strong>Refrendo</strong>",
        html: `
          Si deseas agragar mas vehículos, una vez generado el registro dirígete al menú de <b>configuracion -> impuestos -> refrendo</b> y agreaga los vehiculos
        `,
      });
      this.formTaxPayRecurrent.get('smyt')?.get('numeroserie')?.enable();
      this.formTaxPayRecurrent.get('smyt')?.get('confirmserie')?.enable();
      return;
    }
    this.formTaxPayRecurrent.get('smyt')?.get('numeroserie')?.disable();
    this.formTaxPayRecurrent.get('smyt')?.get('confirmserie')?.disable();*/
    return;
  }

  /*getMessageRecurrent(idMssg:number, nameField:string,subname:string) {
    let touched = this.formTaxPayRecurrent.get(subname)?.get(nameField)?.touched;
    let nameFileValue = this.formTaxPayRecurrent.get(subname)?.get(nameField)?.value;
    let pathSelect = this.validatorService.expSerieVehiculo

    if(idMssg !== null && idMssg !== undefined) {
      const message = this.listMessage().filter(({id}) => id == idMssg );
      return message[0].msg;
    }
    if( touched ) {
      let idMessage=101;
      let pattern = new RegExp(pathSelect);
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.listMessage().filter(({id}) => id == idMessage );
        this.formTaxPayRecurrent.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }
    return '';
  }*/

}
