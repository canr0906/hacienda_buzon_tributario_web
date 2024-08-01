import { inject, Provider, signal } from "@angular/core";
import { UserStruct } from "@auth/interfaces/user-struct.interface";
import { DataServiceGeneralRequest } from "@dashboard/interfaces/data-service-general-request.interfaz";
import { DataDecrypt } from "@shared/classes/data-decrypt";
import { StorageDataStruct } from "@shared/interfaces/localstorage/storage-data-struct.interfaz";
import { GeneralService } from "@shared/services/general.service";
import {TipoServicio} from '@dashboard/interfaces/tipo-servicio.enum';
import { PolicyData } from "@dashboard/interfaces/policyDataRequest.interfaz";
import { environments } from '@environments/environments'
import { lastValueFrom } from 'rxjs';
import { DataEncrypt } from "@shared/classes/data-encrypt";

export class GeneratePolicy {

  //private serviciosGenerales = inject(GeneralService);
  private localStorageUser: UserStruct = {} as UserStruct;
  //private localStorageControl: StorageDataStruct = {} as StorageDataStruct
  private estado = signal<string>('');
  private municipio = signal<string>('');
  private estadoPeticion =signal<boolean>(false);
  private datos: StorageDataStruct = {} as StorageDataStruct;//DataServiceGeneralRequest = {} as DataServiceGeneralRequest;
  //public dataPoliza: DataServiceGeneralRequest = {} as DataServiceGeneralRequest;
  private datosAdicionales: string = '';
  private servicio: string = '';
  private observaciones: string = '';

  constructor(private serviciosGenerales:GeneralService){}

  /*1.- */
  async generatePolicyWithLogin(): Promise<boolean> {
    return await new DataDecrypt(localStorage.getItem('hbtw_user')!).dataDecrypt()
      .then(resp => {
        if(!!resp) {
          if(resp[0] !== undefined) {
            this.localStorageUser = resp[0];
          } else {
            this.localStorageUser = resp;
          }
          this.estadoPeticion.set(true);
          return true;
        }
        this.estadoPeticion.set(false);
        return false;
      })
      .catch(err=>{
        this.estadoPeticion.set(false);
        throw err;
      });
  }
  /*ININIO: 2.- */
  async getState(): Promise<boolean> {
    return await lastValueFrom(this.serviciosGenerales.getEntidadesFederativas(this.localStorageUser.entidad ))
      .then(resp => {
        if (resp!.data.length > 0) {
          this.estado.set(resp!.data[0].descripcion);
          this.estadoPeticion.set(true);
          return true;
        }
        this.estadoPeticion.set(false);
        return false
      })
      .catch(err => {
        this.estadoPeticion.set(false);
        throw err;
      })
  }
  async getMunicipio(): Promise<boolean> {
    if (!!this.localStorageUser.municipio && this.localStorageUser.municipio > 0) {
      return await lastValueFrom(this.serviciosGenerales.getMunicipios(this.localStorageUser.entidad!, this.localStorageUser.municipio))
        .then(resp => {
          if (resp!.data.length > 0) {
            this.municipio.set(resp!.data[0].descripcion);
            this.estadoPeticion.set(true);
            return true;
          }
          this.estadoPeticion.set(false);
          return false;
        })
        .catch(err => {
          this.estadoPeticion.set(false);
          throw err;
        })
    } else {
      this.municipio.set('CUERNAVACA');
      this.estadoPeticion.set(true);
    }
    return true;
  }

  /* FIN */

  /*3.- */
  async getDataServices(): Promise<boolean> {
    return await new DataDecrypt(localStorage.getItem('hbtw_general')!).dataDecrypt()
      .then(resp =>{
        if(!!resp) {
          this.datos = resp;//.hbtw_datos_cobro;
          this.estadoPeticion.set(true);
          return true;
        }
        this.estadoPeticion.set(false);
        return false;
      })
      .catch(err=>{
        this.estadoPeticion.set(false);
        throw err;
      });
  }
  /*4.- */
  async getTipoServicio(): Promise<boolean> {
    let tipoSer = [];
    let route_origen:string = this.datos.hbtw_route_origen?.replaceAll('-','').toUpperCase()!;
    if(route_origen.includes('TABLACONCEPTOS')) {
      this.estadoPeticion.set(true);
      return true;
    } else {
      await Object.entries(TipoServicio).forEach((v, k) => {
        tipoSer = v.toString().split(',');
        if (tipoSer[0]==route_origen.split('/').find((v,k) => k == 1 )){
          this.servicio = tipoSer[1];
        }
      });
      if(!!this.servicio) {
        this.estadoPeticion.set(true);
        return true;
      }
      this.estadoPeticion.set(false);
      return false;
    }
  }
  /*?.- */
  async generatePolyceGeneral(): Promise<boolean> {
    let policyData: PolicyData = {} as PolicyData;
    /*if(!!this.datos) {
      if (this.datos.hbtw_datos_cobro?.tipo_form && this.datos.hbtw_datos_cobro.tipo_form == 3) {
        this.datosAdicionales = `OBSERVACIONES: Fecha próxima de verificación: ${observaciones} ` + datos.fecha_verificacion + ', Placa: ' + datos.placa + ', Serie: ' + datos.serie;
      }
    }*/

    if (this.estadoPeticion()) {
      policyData.sistema = this.datos.hbtw_gestora!;
      policyData.movimiento = environments.MOVIMIENTO_SISTEMA_HACIENDA.toString();
      policyData.total = this.datos.hbtw_contribuyente?.data.total!;
      policyData.rfc = this.localStorageUser.rfc!;
      policyData.nombre = this.localStorageUser.nombre!;
      policyData.primerApellido = this.localStorageUser.apellido_paterno!;
      policyData.segundoApellido = this.localStorageUser.apellido_materno!;
      policyData.razonSocial = this.localStorageUser.nombre!;
      policyData.tipoPersona = this.localStorageUser.tipo!;
      policyData.origen = 'VU';
      policyData.calle = this.localStorageUser.calle!;
      policyData.numeroExterior = this.localStorageUser.no_ext!;
      policyData.numeroInterior = this.localStorageUser.no_int!;
      policyData.colonia = this.localStorageUser.colonia!;
      policyData.municipio = this.municipio();
      policyData.estado = this.estado();
      policyData.codigoPostal = this.localStorageUser.cp!;
      policyData.observaciones = '???';
      policyData.datosAdicionales = '???';
      policyData.detalle = this.datos.hbtw_contribuyente?.data.lineaDetalle!;

      return await lastValueFrom(this.serviciosGenerales.generarPolizaServ(policyData))
        .then(resp =>{
          if(resp.success) {
            this.datos.hbtw_datos_poliza = resp;
            return new DataEncrypt(this.datos).dataEncript('hbtw_general')
              .then(resp => resp??false )
              .catch(err => {
                throw err
              });
          }
          return false;
        })
        .catch(err =>{
          throw err
        });
      /*this.serviciosGenerales.generarPolizaServ(policyData)
          .subscribe({
            next: (resp) => {
              if (resp.success) {
                this.datos.hbtw_datos_poliza = resp;
                new DataEncrypt(this.datos).dataEncript('hbtw_general')
                  .then(resp => {
                    if(!!resp) {
                      return true;
                    }else{
                      throw {message:"No fue posible guardar la información de manera local",error:"Unauthorized",statusCode:412};
                    }
                  })
                  .catch(err=>{
                    throw err;
                  });
              }
              return;
            },
            error: (err) => {
              throw err;
           }
          });*/

    }
    return false;
  }

  getLocalStorageUser() {
    return this.localStorageUser;
  }
}
