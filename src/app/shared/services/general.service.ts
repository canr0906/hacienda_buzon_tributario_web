import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environments } from '@environments/environments';
import { EntidadesRequestStruct } from '@shared/interfaces/entidades-request-struct.interfaz';
import { MunicipiosResponseStruct } from '@shared/interfaces/municipios-response-struct.interfaz';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private http = inject(HttpClient);
  private readonly baseUrlServHacienda: string = environments.BASE_URL_SERVHACIENDA;
  private readonly userServHacienda: string = environments.USER_SERVER_APIREST;
  private readonly passServHacienda: string = environments.PASS_SERVER_APIREST;

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
  public numberPattern: string = "^[0-9]+$";
  public exprCp = '^[0-9]{5}$';//Expresión para validar el código postal
  public expNoTel = '^[\(]([1-9]{2,3})[\)][\ ][0-9]{7,8}$'; // Expresión para validar No Telefónico
  //[\(]?[\+]?(\d{2}|\d{3})[\)]?[\s]?((\d{6}|\d{8})|(\d{3}[\*\.\-\s]){2}\d{3}|(\d{2}[\*\.\-\s]){3}\d{2}|(\d{4}[\*\.\-\s]){1}\d{4})|\d{8}|\d{10}|\d{12}$
  public peoplesNamePath: string = '^(?![0-9]*$)[a-zA-ZÑÁÉÍÓÚ.]+([\ a-zA-ZÑÁÉÍÓÚ.]+)*$';
  public streetNamePath: string = '^(?![*_:]*$)[a-zA-ZÑÁÉÍÓÚ.#0-9\ ]+$';
  public alfaPath: string = '^[a-zA-ZÑ0-9]+$';
  public datePath: string = '^([0-9]{2,})([/])([0-9]{2,})([/])([0-9]{4,})$';//'^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(\d{4})$';
  public rfcPath   = '^[a-zA-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[a-zA-Z0-9]{2}[0-9A]$';
  public rfcFisica = '^([a-zA-Z&Ñ]{4}([0-9]{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01]))([a-zA-Z0-9]{2}[0-9A])?$';
  public rfcMoral  = '^([a-zA-Z&Ñ]{3}([0-9]{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01]))([a-zA-Z0-9]{2}[0-9A])$';

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
        catchError(error => of(null))
      );
  }

  getEntidadesFederativas(idEntidad?:number): Observable<MunicipiosResponseStruct|null> {
    let headers = new HttpHeaders();
    let body: EntidadesRequestStruct = {} as EntidadesRequestStruct;//(idEntidad)?JSON.stringify({"pkEntidadFederativa": idEntidad}):JSON.stringify({});
    body.pkEntidadFederativa = (idEntidad)?idEntidad:0;
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServHacienda}:${this.passServHacienda}`));

    return this.http.post<MunicipiosResponseStruct>(`${this.baseUrlServHacienda}serviciosHacienda/combo/obtenerEstados`,JSON.stringify(body),{headers})
      .pipe(
        catchError(error => of(null))
      );
  }
}
