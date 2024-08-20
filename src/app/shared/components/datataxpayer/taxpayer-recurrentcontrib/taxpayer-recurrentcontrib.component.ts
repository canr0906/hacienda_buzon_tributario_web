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
import { SeriesDataStruct } from '@dashboard/interfaces/smyt/series-data-struct.interfaz';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'hacienda-taxpayer-recurrentcontrib',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './taxpayer-recurrentcontrib.component.html',
  styleUrl: './taxpayer-recurrentcontrib.component.css'
})
export class TaxpayerRecurrentcontribComponent {

  readonly dialog          = inject(MatDialog);
  private validatorService = inject(ValidatorsService);
  private fb               = inject(FormBuilder);

  private listMessage = signal<MessageStruct[]>(MessagesList.smyt_alta_vehiculo)
  public seriesArr    = signal<SeriesDataStruct[]>([]);

  public formTaxPayRecurrent: FormGroup = this.fb.group({
    smyt: this.fb.group({
      refrendo: false,
    }),
    impuestos: this.fb.group({
      erogaciones:false,
      hospedaje:false,
      balnearios:false,
      demasias:false
    })
  });



  checarRefrendo(event:boolean){
    const dialogRef = this.dialog.open(TaxpayerRecurrentrefrendoDialogComponent,{width: '640px', disableClose: true, data:this.seriesArr()});

    dialogRef.afterClosed().subscribe(result => {
      if(result==undefined) {
        this.formTaxPayRecurrent.get('smyt')?.get('refrendo')?.setValue(false);
      } else {
        this.seriesArr.set(JSON.parse(result));//update(() => [...this.seriesArr(),JSON.parse(result)]);
      }
    });

    return;
  }

}
