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
    body.pkEntidadFederativa = idEntidad??null;
    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServHacienda}:${this.passServHacienda}`));

    return this.http.post<MunicipiosResponseStruct>(`${this.baseUrlServHacienda}serviciosHacienda/combo/obtenerEstados`,JSON.stringify(body),{headers})
      .pipe(
        catchError(error => of(null))
      );
  }

}
