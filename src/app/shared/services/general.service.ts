import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PolicyData } from '@dashboard/interfaces/policyDataRequest.interfaz';
import { PolizaDataResponse } from '@dashboard/interfaces/smyt/poliza-data-response.interfaz';
import { environments } from '@environments/environments';
import { EntidadesRequestStruct } from '@shared/interfaces/entidades-request-struct.interfaz';
import { MunicipiosResponseStruct } from '@shared/interfaces/municipios-response-struct.interfaz';
import { Observable, catchError, of, pipe, tap, throwError } from 'rxjs';
import ListErrors from '@shared/data/errors.json';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private http = inject(HttpClient);
  private readonly baseUrlServHacienda: string = environments.BASE_URL_SERVHACIENDA;
  private readonly userServHacienda: string = environments.USER_SERVER_APIREST;
  private readonly passServHacienda: string = environments.PASS_SERVER_APIREST;

  constructor() { }

  getMunicipios(idEntidad:number, idMunicipio?: number): Observable<MunicipiosResponseStruct|null> {
    let headers = new HttpHeaders();
    let body: EntidadesRequestStruct = {} as EntidadesRequestStruct;//JSON.stringify({"pkEntidadFederativa": idEntidad});//new FormData();
    body.pkEntidadFederativa = idEntidad;
    if ( idMunicipio ) {
      body.pkMunicipio = idMunicipio;
    }
    //body.append("pkEntidadFederativa", idEntidad);
    headers = headers.set("Content-Type", "application/json")
    .set("Authorization", "Basic " + btoa(`${this.userServHacienda}:${this.passServHacienda}`));
    //headers = headers.set("mimeType", "multipart/form-data")


    return this.http.post<MunicipiosResponseStruct>(`${this.baseUrlServHacienda}serviciosHacienda/combo/obtenerListaMunicipios`,JSON.stringify(body),{headers})
      .pipe(
        catchError(err => {
          let message = '';
          return throwError( () => {
            if(err.status==401) {
              if(typeof err.error.message == 'object') {
                Object.keys(err.error.message).map(key => message += err.error.message[key]);
              } else {
                message = err.error.message;
              }
            } else {
              message = ListErrors[6].type;
            }
            throw {message:message,error:"Unauthorized",statusCode:ListErrors[6].id};
          });
        })
      );
  }

  getEntidadesFederativas(idEntidad?:number): Observable<MunicipiosResponseStruct|null> {
    let headers = new HttpHeaders();
    let body: EntidadesRequestStruct = {} as EntidadesRequestStruct;//(idEntidad)?JSON.stringify({"pkEntidadFederativa": idEntidad}):JSON.stringify({});
    body.pkEntidadFederativa = idEntidad??null;
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServHacienda}:${this.passServHacienda}`));

    return this.http.post<MunicipiosResponseStruct>(`${this.baseUrlServHacienda}serviciosHacienda/combo/obtenerEstados`,JSON.stringify(body),{headers})
      .pipe(
        catchError(err => {
          let message = '';
          return throwError( () => {
            if(err.status==401) {
              if(typeof err.error.message == 'object') {
                Object.keys(err.error.message).map(key => message += err.error.message[key]);
              } else {
                message = err.error.message;
              }
            } else {
              message = ListErrors[5].type;
            }
            throw {message:message,error:"Unauthorized",statusCode:ListErrors[5].id};
          });
        })
      );
  }

  generarPolizaServ(datosTramite:PolicyData): Observable<PolizaDataResponse> {
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServHacienda}:${this.passServHacienda}`));

    return this.http.post<PolizaDataResponse>(`${this.baseUrlServHacienda}serviciosHacienda/poliza/generar`,JSON.stringify(datosTramite),{headers})
      .pipe(
        //TODO: Errores
        catchError( err =>{
          let message = '';
          return throwError( () => {
            if(err.status==401) {
              if(typeof err.error.message == 'object') {
                Object.keys(err.error.message).map(key => message += err.error.message[key]);
              } else {
                message = err.error.message;
              }
            } else {
              message = ListErrors[4].type;
            }
            throw {message:message,error:"Unauthorized",statusCode:ListErrors[4].id};
          });
        })
      );
  }

}
