import { Component, inject, signal, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MessageStruct } from '@shared/interfaces/message-struct.interfaz';
import { ValidatorsService } from '@shared/services/validators.service';

import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';

import MessagesList from '@shared/data/messages.json';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SeriesDataStruct } from '@dashboard/interfaces/smyt/series-data-struct.interfaz';



@Component({
  selector: 'app-taxpayer-recurrentrefrendo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './taxpayer-recurrentrefrendo-dialog.component.html',
  styles: ``
})
export class TaxpayerRecurrentrefrendoDialogComponent implements OnInit {

  private validatorService = inject(ValidatorsService);
  private fb               = inject(FormBuilder);
  readonly dialogRef       = inject(MatDialogRef<TaxpayerRecurrentrefrendoDialogComponent>);
  readonly data            = inject<SeriesDataStruct[]>(MAT_DIALOG_DATA);

  private listMessage      = signal<MessageStruct[]>(MessagesList.smyt_alta_vehiculo)
  public seriesArr         = signal<SeriesDataStruct[]>([]);

  public formTaxPayRecurrentRefrendo: FormGroup = this.fb.group({
    arrSeries: this.fb.array([])
  });

  get arrSeries() {
    return this.formTaxPayRecurrentRefrendo.get('arrSeries') as FormArray;
  }

  get numeroserie() {
    return this.formTaxPayRecurrentRefrendo.get('arrSeries')?.get('numeroserie') as FormArray;
  }
  get confirmserie() {
    return this.formTaxPayRecurrentRefrendo.get('arrSeries')?.get('confirmserie') as FormArray;
  }

  ngOnInit(): void {
    if(this.data.length>0) {
      this.data.forEach(x => {
        const grupo = this.fb.group({
          numeroserie: [x.serie, [Validators.required, Validators.pattern(this.validatorService.expSerieVehiculo)]],
          confirmserie: [x.serie, [Validators.required]]
        },{validators: [this.validatorService.isFieldOneEqualFielTwo('numeroserie', 'confirmserie',4)]});

        this.arrSeries.push(grupo);
      })
    }else{
      const grupo = this.fb.group({
        numeroserie: ['', [Validators.required, Validators.pattern(this.validatorService.expSerieVehiculo)]],
        confirmserie: ['', [Validators.required]]
      },{validators: [this.validatorService.isFieldOneEqualFielTwo('numeroserie', 'confirmserie',4)]})

      this.arrSeries.push(grupo);
    }
  }

  getMessageRecurrent(idMssg:number, nameField:string,subname:string) {
    /*this.numeroserie.controls.forEach(resp=>console.log(resp))
    console.log(idMssg)
    let touched = this.formTaxPayRecurrentRefrendo.get(subname)?.get(nameField)?.touched;
    let nameFileValue = this.formTaxPayRecurrentRefrendo.get(subname)?.get(nameField)?.value;
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
        this.formTaxPayRecurrentRefrendo.get(subname)?.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }*/
      let messge: string = '';
      /*if(nameField=='numeroserie') {
        this.numeroserie.controls.forEach((val,key)=>{
          if(!!val.errors) {
            if(!!val.errors['required']) {
              messge = 'Este campo requerido';
            }else{
              messge = 'Formato incorrecto';
            }
          }
          //messge = '';
        })
      }
      if(nameField=='confirmserie') {
        this.confirmserie.controls.forEach((val,key)=>{
          if(!!val.errors) {
            if(!!val.errors['required']) {
              messge = 'Este campo requerido';
            }else{
              messge = 'Formato incorrecto';
            }
          }
          //messge = '';
        })
      }*/
    return messge;
  }

  addNewSerie(){
    const grupo = this.fb.group({
      numeroserie: ['', [Validators.required, Validators.pattern(this.validatorService.expSerieVehiculo)]],
      confirmserie: ['', [Validators.required]]
    },{validators: [this.validatorService.isFieldOneEqualFielTwo('numeroserie', 'confirmserie',4)]});

    this.arrSeries.push(grupo);
  }

  removeArrSerie(){
    this.arrSeries.removeAt(this.arrSeries.length-1);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  sendData(){
    this.arrSeries.controls.forEach((v,k) => {
      this.seriesArr.update(() => [...this.seriesArr(),{serie:v.value.numeroserie}])
    })

    this.dialogRef.close(JSON.stringify(this.seriesArr()));
  }
}
