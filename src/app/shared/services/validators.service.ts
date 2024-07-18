import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";
  public exprCp = '^[0-9]{5}$';//Expresión para validar el código postal
  public expNoTel = '^[\(]([1-9]{2,3})[\)][\ ][0-9]{7,8}$'; // Expresión para validar No Telefónico
  //[\(]?[\+]?(\d{2}|\d{3})[\)]?[\s]?((\d{6}|\d{8})|(\d{3}[\*\.\-\s]){2}\d{3}|(\d{2}[\*\.\-\s]){3}\d{2}|(\d{4}[\*\.\-\s]){1}\d{4})|\d{8}|\d{10}|\d{12}$
  public peoplesNamePath: string = '^(?![0-9]*$)[a-zA-ZÑÁÉÍÓÚ.]+([\ a-zA-ZÑÁÉÍÓÚ.]+)*$';
  public streetNamePath: string = '^(?![*_:]*$)[a-zA-ZÑÁÉÍÓÚ.#0-9\ ]+$';
  public alfaPath: string = '^[a-zA-ZÑ0-9]+$';
  public expSerieVehiculo: string = '^[a-zA-ZÑ0-9]{17}$';
  public datePath: string = '^([0-9]{2,})([/])([0-9]{2,})([/])([0-9]{4,})$';//'^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(\d{4})$';
  public rfcFisica = '^([a-zA-Z&Ñ]{4}([0-9]{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01]))([a-zA-Z0-9]{2}[0-9A])?$';
  public rfcMoral  = '^([a-zA-Z&Ñ]{3}([0-9]{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01]))([a-zA-Z0-9]{2}[0-9A])$';
  /*
    (?=.*?[A-Z]) Al menos una letra MAyuscula
    (?=.*?[a-z]) Al menos una letra minuscula
    (?=.*?[0-9]) al menos un digito
    (?=.*?[#?!@$%^&*-]) Al menos un caracter especial
    (?!.* ) No contener espacios
    .{6,15} Minimo 6 maximo 15
  */
  public expValidPass = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[@$&])(?!.* ).{6,15}$';//'^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,15}$'

  constructor() { }

  /* validar fecha mayor a  */
  public cantBeGreat = ( control: FormControl ): ValidationErrors | null => {

    let value = moment(control.value).toDate();
    let toDate = new Date()
    if( value > toDate) {
      return {dateGrate:true}
    }
    return null
  }

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors
      && form.controls[field].touched;
  }

  isFieldOneEqualFielTwo( field1: string, field2: string, mssg: number) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {
      console.log(formGroup.get(field1)?.status)
      console.log(formGroup.get(field2)?.status)
      if(formGroup.get(field1)?.status !== 'VALID' || formGroup.get(field2)?.status !== 'VALID')
        return null;
      const fielValue1 = formGroup.get(field1)?.value;
      const fielValue2 = formGroup.get(field2)?.value;
      console.log(fielValue1 + "!==" + fielValue2)
      if ( fielValue1 !== fielValue2) {
        formGroup.get(field2)?.setErrors( { notEqual: true, error:mssg } );
        return { notEqual: true, error:mssg };
      }
      formGroup.get(field2)?.markAsTouched();
      formGroup.get(field2)?.setErrors( null );
      return null;

    }
  }
}
