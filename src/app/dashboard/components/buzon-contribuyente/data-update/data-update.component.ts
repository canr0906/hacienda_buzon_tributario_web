import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpdatePersonalData } from '@dashboard/classes/buzon-contribuyente/update-personal-data';
import { DataEmailStruct } from '@dashboard/interfaces/buzon-contribuyente/data-email-struct.interfaz';
import { DataPhoneStruct } from '@dashboard/interfaces/buzon-contribuyente/data-phone-struct.interfaz';
import { VerifyEmailsCodes } from '@dashboard/interfaces/buzon-contribuyente/verify-emails-codes.interfaz';
import { ConsultaAvisosService } from '@dashboard/services/buzon-contribuyente/consulta-avisos.service';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import Swal from 'sweetalert2';
import * as uuid from 'uuid';

const ELEMENT_DATA: DataEmailStruct[] = [];
const ELEMENT_PHONE: DataPhoneStruct[] = [];

@Component({
  selector: 'buzon-data-update',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadSpinnerComponent,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './data-update.component.html',
  styleUrl: './data-update.component.css'
})
export class DataUpdateComponent implements AfterViewInit,OnInit,OnDestroy {
  displayedColumns: string[] = ['direccion_correo', 'tipo_contacto', 'accion'];
  dataSource = ELEMENT_DATA;

  displayedColumnsPhone: string[] = ['no_telefonico', 'tipo_contacto', 'tipo', 'extension', 'accion'];
  dataSourcePhone = ELEMENT_PHONE;

  private avisosService = inject(ConsultaAvisosService);
  //private messagesList = signal<MessageStruct[]>(MessagesList.user_update_data);

  private arrEmails: VerifyEmailsCodes[] = [];
  //private arrPhone: arrPhoneCodes[] = [];


  @ViewChild('mattableemail') table!: MatTable<DataEmailStruct>;
  @ViewChild('mattablephone') tablePhone!: MatTable<DataPhoneStruct>;

  @Input()//{ required:true })
  public priorida = signal<number>(0); //Subject<number> = new Subject<number>();
  @Input()
  public tIdent = signal<number>(0);
  @Input()
  pkAviso = signal<number>(0);
  @Input()
  public curp = signal<string>('');
  @Input()
  public sistema = signal<number>(0);
  @Input()
  public rfc = signal<string>('');

  @Output()
  public flagAttendedUpdate = new EventEmitter<boolean>();

  /* CONTROLA EL LOADING CUANDO SE ENVIA EL CODIGO DE VERIFICACION */
  public statusSendVerifyCode = signal<boolean>(false);


  private fb = inject(FormBuilder);
  public myForm: FormGroup = this.fb.group({
    email: ['',[Validators.required, Validators.pattern(this.avisosService.emailPattern)]],
    tipoContacto: ['',[Validators.required]],
    codigoVerif: ['',[Validators.required]]
  });
  public myFormPhone: FormGroup = this.fb.group({
    noPhone: ['',[Validators.required, Validators.pattern(this.avisosService.expNoTel)]],
    tipoContactoP: ['',[Validators.required]],
    tipoPhone: ['',[Validators.required]],
    extension: ['']
  });

  constructor(private _snackBar: MatSnackBar) {}

  ngOnDestroy(): void {
    //this.priorida.unsubscribe();
  }

  ngOnInit(): void {
    /*this.priorida.subscribe(resp => {
      console.log("Prioridad: " + resp)
    });*/
  }

  ngAfterViewInit(): void {
    let message = "CORREOS Y TELEFONOS MÍNIMO 1 MAXIMO 5";
    this.openSnackBar(message,'Undo');

    console.log("Prioridad: " + this.priorida);

  }

  sendVerifyCode(): void {
    if(this.myForm.get('email')?.invalid) {
      this.openSnackBar('SE REQUIERE CORREO ELECTRONICO', '');
      return;
    }
    this.statusSendVerifyCode.set(true);
    const myId = uuid.v4().substring(0,23).replaceAll('-','');

    this.arrEmails = this.arrEmails.filter(resp => resp.email!=this.myForm.get('email')?.value);
    this.arrEmails.push({email:this.myForm.get('email')?.value,code:myId});
    this.avisosService.sendMailVerifyCode({email:this.myForm.get('email')?.value,code:myId})
      .subscribe({
        next: (resp) =>{
          if(resp.success) {
            this.openSnackBar("EL CÓDIGO SE HA ENVIADO, REVISE SU CORREO Y COPIE EL CÓDIGO EN EL CAMPO COÓGO", '');
          }
        },
        complete: () => this.statusSendVerifyCode.set(false),
        error: (error) => {
          Swal.fire('Error', error, 'error');
          throw error;
         }
      });
  }
  addEmail() {
    if(this.myForm.invalid) {
      return;
    }

    console.log(JSON.stringify(this.arrEmails))
    if(this.arrEmails.filter(resp => resp.email == this.myForm.get('email')?.value && resp.code==this.myForm.get('codigoVerif')?.value).length <= 0) {
      Swal.fire('Error', 'RELACIÓN CÓDIGO CORREO NO COINCIDEN, FAVOR DE VALIDAR LA INFORMACIÓN', 'error');
      return;
    }

    if(this.dataSource.findIndex(val=>val.direccion_correo==this.myForm.get('email')?.value)<0) {
      this.dataSource.push({direccion_correo: this.myForm.get('email')?.value,
        tipo_contacto: this.myForm.get('tipoContacto')?.value,
        accion: ``});
      this.myForm.reset();
      this.table.renderRows();
      return;
    }
    Swal.fire('Error', 'EL CORREO NO SE AGREGO A LA TABLA PORQUE YA EXISTE, SI DESEA MODIFICAR ALGUN PARÁMETRO DEL CORREO, BÓRRELO DE LA TABLA Y GENERE NUEVAMENTE EL CÓDIGO', 'error').then(()=>{this.myForm.reset()});
      return;
  }

  addPhone() {
    if(this.myFormPhone.invalid) {
      return;
    }
    if(this.dataSourcePhone.findIndex(val=>val.no_telefonico == this.myFormPhone.get('noPhone')?.value)<0) {
      this.dataSourcePhone.push(
        {
          no_telefonico: this.myFormPhone.get('noPhone')?.value,
          tipo_contacto: this.myFormPhone.get('tipoContactoP')?.value,
          tipo: this.myFormPhone.get('tipoPhone')?.value,
          extension: this.myFormPhone.get('extension')?.value,
          accion: ``
        }
      );
      this.myFormPhone.reset();
      this.tablePhone.renderRows();
      return;
    }
    Swal.fire('Error', 'EL TELÉFONO NO SE AGREGO A LA TABLA PORQUE YA EXISTE, SI DESEA MODIFICAR ALGUN PARÁMETRO DEL TELÉFONO, BÓRRELO Y AGREGUELO CON LA MODIFICACIÓN', 'error').then(()=>{this.myForm.reset()});

    return;

  }

  garbageColect(event:any, table:string='dataSource') {
    if(table=='dataSource') {
      this.dataSource = this.dataSource.filter(row=>row.direccion_correo!=event);
    } else {
      this.dataSourcePhone = this.dataSourcePhone.filter(row=>row.no_telefonico!=event);
    }
  }

  getMessage(idMssg: ValidationErrors | null | undefined, nameField: string){
    if (!idMssg) {
      return '';
    }
    const errors = Object.keys(idMssg);
    if (errors.includes('required')) {
      return 'Este campo requerido';
    }
    if (errors.includes('min')) {
      return 'No se permite valor menor a 1';
    }
    if (errors.includes('max')) {
      return 'Para poder continuar seleccione NO';
    }
    if (errors.includes('pattern')) {
      return 'Formato incorrecto';
    }

    return '';
  }

  saveDataUser() {
    if(this.dataSource.length<=0 || this.dataSourcePhone.length<=0) {
      Swal.fire('Error', 'UN EMAIL Y UN TELÉFONO SON REQUERIDOS', 'error');
      return;
    }

    let personalDataEmail:DataEmailStruct[] = [];
    let personalDataPhone:DataPhoneStruct[] = [];

    /*
      DATOS DE CORREO
      PRIMER LINEA VALIDA QUE TANTO EN CORREO Y TELEFONO EXISTA UN PRINCIPAL
    */
    if(this.dataSource.some(resp => resp.tipo_contacto=='1') && this.dataSourcePhone.some(res => res.tipo_contacto=='1')) {
      this.dataSource.forEach(resp => {
        console.log('RESP: ' + JSON.stringify( resp ))
        if(resp.tipo_contacto)
        personalDataEmail.push(resp);
      });

      this.dataSourcePhone.forEach(resp => {
        personalDataPhone.push(resp);
      });

      let classPerdonalData = new UpdatePersonalData(personalDataEmail,personalDataPhone,this.pkAviso(),this.sistema(),this.tIdent(),this.rfc(),this.curp());

      this.avisosService.updatePersonalData(classPerdonalData)
        .subscribe({
          next: (resp) => {
            if(resp.success) {
              this.avisosService.messageAttended({
                pkAviso:  this.pkAviso(),
                tipoIdentificacion: this.tIdent(),
                rfc:       this.rfc(),
                curp:      this.curp(),
                pkSistema:    this.sistema()
              })
              .subscribe({
                next:(response) => {
                  if(response.success) {
                    Swal.fire(
                      {
                        icon: "success",
                        title: response.data,
                        showConfirmButton: false,
                        timer: 1500
                      }
                    ).then(()=>{
                      this.flagAttendedUpdate.emit(true);
                    });
                  } else {
                    Swal.fire('Error', response.data, 'error');
                  }
                }
              })
            } else {
              Swal.fire('Error', resp.data, 'error');
            }
          }
        });
    } else {
      Swal.fire('Error', 'FAVOR DE ESÉCIFICAR UN CORREO Y UN TELEFONO COMO PRINCIPAL', 'error');
      return;
    }
  }

  /* CONTROLA EL EVENTO CLICK SOBRE BOTON DE ATENDIDO. flagAttended ENVIA UN VALOR DE CONOCIMIENTO DE CLICK AL PADRE layaout.dash */
  eventAttended() {
    this.flagAttendedUpdate.emit(true);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      duration: 3000,horizontalPosition: "center", verticalPosition: "top"
    });
  }
}
