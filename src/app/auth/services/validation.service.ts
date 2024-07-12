import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /* RECIBE DOS CAMPOS DE FORMULARIO, Y EVALUA SI UNO ES VALIDO DESHABILITA LA VALIDACION DEL SEGUNDO. SE HACE ESTO CON AMBOS CAMPOS  */
  validatorsFactory(fielOneValidate: string, fieldTwoValidate: string) {
    console.log('entra')
    return (formGroup: AbstractControl): ValidationErrors | null => {
      /*if(formGroup.get(fielOneValidate)?.value == '' && formGroup.get(fieldTwoValidate)?.value == '') {
        formGroup.get(fieldTwoValidate)?.setValidators([Validators.required]);
        formGroup.get(fieldTwoValidate)?.updateValueAndValidity();
        formGroup.get(fielOneValidate)?.setValidators([Validators.required]);
        formGroup.get(fielOneValidate)?.updateValueAndValidity();
        return null;
      }*/
      if(formGroup.get(fielOneValidate)?.valid) {
        formGroup.get(fieldTwoValidate)?.setValidators(null);
        formGroup.get(fieldTwoValidate)?.updateValueAndValidity();
      } else if(formGroup.get(fieldTwoValidate)?.valid) {
        formGroup.get(fielOneValidate)?.setValidators(null);
        formGroup.get(fielOneValidate)?.updateValueAndValidity();
      }
      return null;
    }
  }
}
