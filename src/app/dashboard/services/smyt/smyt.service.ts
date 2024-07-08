import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { OfficesResponseStruct } from '@dashboard/interfaces/smyt/offices-response-struct.interfaz';
import { environments } from '@environments/environments';
import { Observable, catchError, of } from 'rxjs';

import OficinasTramite from '@dashboard/data/smyt/oficinas_tramite.json'
import TipoVehiculo from '@dashboard/data/smyt/vehicle_type.json'
import { VehicleTypeResponseStruct } from '@dashboard/interfaces/smyt/vehicle-type-response-struct.interfacz';
import { VehicleDataRequestStruct } from '@dashboard/interfaces/smyt/vehicle-data-request-struct';
import { VehicleDataResponseStruct } from '@dashboard/interfaces/smyt/vehicle-data-response-struct';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SmytService {

  private readonly baseUrlHacienda: string = environments.BASE_URL_SERVHACIENDA;
  private readonly userServiceHacienda: string = environments.USER_SERVER_APIREST;
  private readonly passServiceHacienda: string = environments.PASS_SERVER_APIREST;
  //private urlSOAP:string = environments.BASE_URL_SERV;
  private http = inject(HttpClient);

  constructor() { }

  /*getOficinas(): Observable<StructOffice>{
    const url = `${this.baseUrl}/api/v1/menu-portal/findoficinas`;
    let headers = new HttpHeaders()
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.USER_SERVER}:${environments.PASS_SERVER}`));
    return this.http.get<StructOffice>(url,{headers});
  }*/
  getOficinas(): Observable<OfficesResponseStruct>{
    return of({success:true,data:OficinasTramite});
  }

  /*getTipoVahiculo(): Observable<StructTipoVehiculo> {
    const url = `${this.baseUrl}/api/v1/menu-portal/findotipovehiculo`;
    let headers = new HttpHeaders()
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${environments.USER_SERVER}:${environments.PASS_SERVER}`));
    return this.http.get<StructTipoVehiculo>(url,{headers});
  }*/
  getTipoVahiculo(): Observable<VehicleTypeResponseStruct> {
    return of({success:true,data:TipoVehiculo});
  }

  validateVehicle(datosTramite:VehicleDataRequestStruct): Observable<VehicleDataResponseStruct | null> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServiceHacienda}:${this.passServiceHacienda}`));

    return this.http.post<VehicleDataResponseStruct>(`${this.baseUrlHacienda}serviciosHacienda/smyt/particular`,JSON.stringify(datosTramite),{headers})
      .pipe(
        catchError(error => of())
      );
  }

  otherCalculoPagos(datosTramite:object): Observable<VehicleDataResponseStruct> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServiceHacienda}:${this.passServiceHacienda}`));

    return this.http.post<VehicleDataResponseStruct>(`${this.baseUrlHacienda}serviciosHacienda/concepto/obtenerConcepto`,JSON.stringify(datosTramite),{headers});
  }

  getCalculoPagos(datosTramite:VehicleDataRequestStruct): Observable<VehicleDataResponseStruct> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServiceHacienda}:${this.passServiceHacienda}`));

    return this.http.post<VehicleDataResponseStruct>(`${this.baseUrlHacienda}serviciosHacienda/smyt/particular`,JSON.stringify(datosTramite),{headers});
  }

  public existsPlaca(placa: string, mssg: number, tramite: number, tipoVehiculo: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      let tipo: string = tipoVehiculo;
      let dateForm;
      if (tipoVehiculo === 'tipo_vehiculo')
        tipo = formGroup.get(tipoVehiculo)?.value;

      const fileValue2 = formGroup.get(placa)?.value;

      let parameters = { "tramite": tramite, "placa": fileValue2, "tipoVehiculo": Number.parseInt(tipo), fechaFactura: dateForm, "obtenerContribuyente": false };
      if (!formGroup.get(placa)?.pristine) {
        this.validateVehicle(parameters)
          .subscribe({
            next: (resp) => {
              if (resp?.success) {
                formGroup.get(placa)?.setErrors(null);
                return null;
              }
              formGroup.get(placa)?.setErrors({ notEqual: true, error: mssg });
              return { notEqual: true };
            }
          }

            /*resp => {
            console.log(resp);
            if (resp?.success) {
              formGroup.get(serie)?.setErrors( null );
              return null;
            }
            formGroup.get(serie)?.setErrors( { notEqual: true, error:mssg } );
            return { notEqual: true };
          }*/);
      }

      formGroup.get(placa)?.markAsTouched();
      formGroup.get(placa)?.setErrors(null);
      return null;
    }
  }

  public existsSerie(placa: string, serie: string, mssg: number, tramite: number, tipoVehiculo: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      let tipo: string = tipoVehiculo;
      let dateForm;
      if (tipoVehiculo === 'tipo_vehiculo')
        tipo = formGroup.get(tipoVehiculo)?.value;

      const fileValue2 = formGroup.get(placa)?.value;
      const fileValue1 = formGroup.get(serie)?.value;

      dateForm = new Date().getDate() + '/' + (new Date().getMonth()+1) + '/' + new Date().getFullYear();
      if(formGroup.get(placa)?.status !== 'DISABLED' && formGroup.get(placa)?.status !== undefined ) {
        tramite = 1;
        mssg = 4;
      }
        //return null;

      let parameters = { "tramite": tramite, "placa": fileValue2, "numeroSerie": fileValue1, "tipoVehiculo": Number.parseInt(tipo), fechaFactura: dateForm, "obtenerContribuyente": false };
      if (!formGroup.get(serie)?.pristine) {
        this.validateVehicle(parameters)
          .subscribe({
            next: (resp) => {
              if (resp?.success) {
                formGroup.get(serie)?.setErrors(null);
                return null;
              }
              formGroup.get(serie)?.setErrors({ notEqual: true, error: mssg });
              return { notEqual: true };
            }
          }
        );
      }

      formGroup.get(serie)?.markAsTouched();
      formGroup.get(serie)?.setErrors(null);
      return null;
    }
  }

  /*async getTaxpayData(dataVehicleLs: DatosTramite): Promise<any> {
    return await fetch(`${this.urlSOAP}tramitesSMyT/services/SMyT?wsdl`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:smyt="http://SMyT/">
      <soapenv:Header/>
      <soapenv:Body>
         <smyt:obtenEstatusVehiculo>
            <!--Optional:-->
            <placa>${dataVehicleLs.placa}</placa>
            <!--Optional:-->
            <noSerie>${dataVehicleLs.numeroSerie}</noSerie>
            <!--Optional:-->
            <usuario>?</usuario>
         </smyt:obtenEstatusVehiculo>
      </soapenv:Body>
   </soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8" }
    })
  }*/
}
