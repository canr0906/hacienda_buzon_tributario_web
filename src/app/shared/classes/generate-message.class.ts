/* arreglo de datos */
import MessagesList from '@shared/data/messages.json';
import {MessageStruct} from '@shared/interfaces/message-struct.interfaz';
import { FormGroup } from '@angular/forms';
import { GeneralService } from '@shared/services/general.service';
import { ValidatorsService } from '@shared/services/validators.service';

export class GenerateMessage {

  public mssgArr: MessageStruct[] = MessagesList.taxpayer//ListMessageSmyt.smyt;
  //private generalService = inject(GeneralService);

  constructor(private generalService: ValidatorsService){}

  getMessage(formGroup: FormGroup, idMssg:number, nameField:string) {

      let touched = formGroup.get('domicilio')?.get(nameField)?.touched;
      let nameFileValue = formGroup.get('domicilio')?.get(nameField)?.value;
      let pathSelect = this.generalService.streetNamePath;


      if(idMssg !== null && idMssg !== undefined) {
        const message = this.mssgArr.filter(({id}) => id == idMssg )
        return message[0].msg;
      }
      if(nameField === 'nombre' || nameField === 'primerApellido' || nameField === 'segundoApellido' || nameField === 'razonSocial') {
        touched = formGroup.get(nameField)?.touched;
        nameFileValue = formGroup.get(nameField)?.value;
        pathSelect = this.generalService.peoplesNamePath
      }

      if( touched ) {
        let idMessage=101;
        let pattern = new RegExp(pathSelect);
        if(!pattern.test(nameFileValue) || nameFileValue == null) {
          if (nameFileValue === null || nameFileValue == '') {
            idMessage = 100;
          }
          const message = this.mssgArr.filter(({id}) => id == idMessage );
          formGroup.get('domicilio')?.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
          if(nameField === 'nombre' || nameField === 'primerApellido' || nameField === 'segundoApellido' || nameField === 'razonSocial') {
            formGroup.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
          }
          return message[0].msg;
        }

      }
      return '';
  }

}
