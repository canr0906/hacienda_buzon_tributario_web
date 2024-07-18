import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import MessagesList from '@shared/data/messages.json';
import { MessageStruct } from '@shared/interfaces/message-struct.interfaz';
import { ValidatorsService } from '@shared/services/validators.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'hacienda-taxpayer-pass',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './taxpayer-pass.component.html',
  styleUrl: './taxpayer-pass.component.css'
})
export class TaxpayerPassComponent implements AfterViewInit {


  private validatorService = inject(ValidatorsService);

  private listMessage = signal<MessageStruct[]>(MessagesList.taxpayer)


  private fb = inject(FormBuilder);
  public formTaxPayPass: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15),Validators.pattern(this.validatorService.expValidPass)]],
    confpass: ['', [Validators.required, Validators.minLength(8)]]
  },
  {
    validators: [
      this.validatorService.isFieldOneEqualFielTwo('password', 'confpass',2)
    ]
  }
  );

  ngAfterViewInit(): void {
    Swal.fire('PASSWORD', "De 8 - 15 caracteres Al menos una mayuscula, almenos una minuscula, almenos un caracter @$&", 'info');
  }

  getMessagePass(idMssg:number, nameField:string) {
    let touched = this.formTaxPayPass.get(nameField)?.touched;
    let nameFileValue = this.formTaxPayPass.get(nameField)?.value;
     let pathSelect = this.validatorService.expValidPass
     console.log(this.formTaxPayPass.get(nameField)?.errors)
    if(idMssg !== null && idMssg !== undefined) {
      const message = this.listMessage().filter(({id}) => id == idMssg );
      return message[0].msg;
    }
    if( touched ) {
      let idMessage=101;
      let pattern = new RegExp(pathSelect);
      console.log(pattern.test(nameFileValue))
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.listMessage().filter(({id}) => id == idMessage );
        this.formTaxPayPass.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }
    return '';
  }
}
