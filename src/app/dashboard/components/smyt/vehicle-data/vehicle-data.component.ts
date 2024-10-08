import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';

import { CUSTOM_DATE_FORMATS } from '@dashboard/formats/custom-date-format';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';
import 'moment/locale/es';
import { SmytService } from '@dashboard/services/smyt/smyt.service';
import { VehicleTypeDataStruct } from '@dashboard/interfaces/smyt/vehicle-type-response-struct.interfacz';
import { OfficeDataStruct } from '@dashboard/interfaces/smyt/offices-response-struct.interfaz';
import { MessageStruct } from '@shared/interfaces/message-struct.interfaz';

import MessagesLists from '@shared/data/messages.json'
import { ValidatorsService } from '@shared/services/validators.service';
import { VehicleBySerie } from '@dashboard/interfaces/smyt/vehicle-by-serie.interfaz';


@Component({
  selector: 'smyt-vehicle-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers:[
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
  templateUrl: './vehicle-data.component.html',
  styleUrl: './vehicle-data.component.css'
})
export class VehicleDataComponent implements OnInit {

  private smytService = inject(SmytService);

  public formBlock = signal<boolean>(true);

  private validatorsService = inject(ValidatorsService);

  public tipoVehiculoArr = signal<VehicleTypeDataStruct[]>([]);


  @Input({required:true})
  public disablesOffice = signal<boolean>(false);

  @Input({required:true})
  public disablesSerie= signal<boolean>(false);

  @Input({required:true})
  public disablesValorVenta= signal<boolean>(false);

  @Input({required:true})
  public disabledPlaca= signal<boolean>(false);

  @Input({required:true})
  public disabledTipoV= signal<boolean>(false);

  @Input({required:true})
  public disablesSerieSec= signal<boolean>(false);

  @Input({required:true})
  public disableDate= signal<boolean>(false);

  @Input({required:true})
  public isAuthInParent = signal<boolean>(false);

  @Input()
  public arrSeries = signal<VehicleBySerie[]>([])

  @Output()
  private tipoVehiculoEmit = new EventEmitter<number>();


  private fb = inject(FormBuilder);
  public myFormSmyt!: FormGroup;

  public officeList = signal<OfficeDataStruct[]>([]);
  public mssgArr = signal<MessageStruct[]>(MessagesLists.smyt_alta_vehiculo);

  /* NOTA: CONVIERTE TODAS LAS ENTRADAS DE TEXTO EN MAYUSCULAS */
  @HostListener('input', ['$event']) onKeyUp(event:any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  constructor(
    private _adapter: DateAdapter<any>,
    private _intl: MatDatepickerIntl,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
  ) {
    this.myFormSmyt = this.fb.group({
      oficina:       [{value:'',disabled:true}, [Validators.required]],
      tipo_vehiculo: [{value:'',disabled:true},[Validators.required]],
      placa:         [{value:'',disabled:true}, [Validators.required]],
      serie:         [{value:'',disabled:true}, [Validators.required]],
      seriesec:      [{value:'',disabled:true},[Validators.required]],
      valor_venta:   [{value:'',disabled:true}, [Validators.required, Validators.min(40)]],
      fecha_factura: [new Date(),[Validators.required, this.validatorsService.cantBeGreat]]
    },{
      validators: [
        this.smytService.existsPlaca('placa',1, 1, '1'),
        this.smytService.existsSerie('placa','serie',3, 2, '1'),
        this.validatorsService.isFieldOneEqualFielTwo('serie', 'seriesec',1),
      ]
    });
  }

  ngOnInit(): void {
    this._locale = 'es';
    this._adapter.setLocale(this._locale);

    this.smytService.getOficinas()
      .subscribe({
        next:(resp) => {
          this.officeList.set(resp.data);
        },
        error: (err) => {
          console.log(err);
        }
      });

    this.smytService.getTipoVahiculo()
      .subscribe({
        next:(resp) => {
          this.tipoVehiculoArr.set(resp.data);
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

  getMessageDate(idMssg:number, nameField:string) {
    let nameFileValue = moment(this.myFormSmyt.get(nameField)?.value).toDate();
    let pathSelect = this.validatorsService.datePath;
    let stringVal = nameFileValue.getDate()+'/'+(nameFileValue.getMonth()+1)+'/'+nameFileValue.getFullYear();

    let pattern = new RegExp(pathSelect);
      if(!pattern.test(stringVal) || nameFileValue == null) {
        const message = this.mssgArr().filter(({id}) => id == 100 );
        this.myFormSmyt.get(nameField)?.setErrors( { notEqual: true, error:100 } );
        return message[0].msg;
      }
      return '';
  }

  getMessage(idMssg:number, nameField:string) {
    let touched = this.myFormSmyt.get(nameField)?.touched;
    let nameFileValue = this.myFormSmyt.get(nameField)?.value;
    let pathSelect = this.validatorsService.alfaPath;

    if(idMssg !== null && idMssg !== undefined) {
      const message = this.mssgArr().filter(({id}) => id == idMssg );
      return message[0].msg;
    }
    if( touched ) {
      let idMessage=101;
      if(nameField==='fecha_factura'){
        idMessage = 100;
        nameFileValue = this.myFormSmyt.get(nameField)?.value;
        pathSelect = this.validatorsService.datePath;
        this.getMessageDate(idMssg, nameField);

      }

      let pattern = new RegExp(pathSelect);
      if(!pattern.test(nameFileValue) || nameFileValue == null) {
        const message = this.mssgArr().filter(({id}) => id == idMessage );
        this.myFormSmyt.get(nameField)?.setErrors( { notEqual: true, error:idMessage } );
        return message[0].msg;
      }

    }
    return '';
  }

  changeFielVehicleType(value: any) {
    this.tipoVehiculoEmit.emit(value);
  }

  getSerie(val:any){
    this.myFormSmyt.get('serie')?.setValue(this.arrSeries().filter(resp => resp.placa==val)[0].no_serie)
  }

}
