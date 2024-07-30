import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConsultaAvisosRequest } from '@dashboard/interfaces/buzon-contribuyente/consulta-avisos-request.interfaz';
import { ConsultaAvisosResponse } from '@dashboard/interfaces/buzon-contribuyente/consulta-avisos-response.interfaz';
import { GenericResponse } from '@dashboard/interfaces/buzon-contribuyente/generic-response.interfaz';
import { MessageAtenddedRequest } from '@dashboard/interfaces/buzon-contribuyente/message-atendded-request.interfaz';
import { VerifyEmailsCodes } from '@dashboard/interfaces/buzon-contribuyente/verify-emails-codes.interfaz';
import { environments } from '@environments/environments';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultaAvisosService {

  private http = inject(HttpClient);
  private urlServiciosIngresos = environments.BASE_URL_APIREST;

  private headers!:HttpHeaders;

  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
  public expNoTel = '^[\(]([1-9]{2,3})[\)][\ ][0-9]{7,8}$'; // Expresión para validar No Telefónico

  constructor() { }

  doToConnection() {
    this.headers = new HttpHeaders();
    this.headers = this.headers.set("Content-Type", "application/json");
  }

  getConsultaAvisos(structData:ConsultaAvisosRequest): Observable<ConsultaAvisosResponse | null> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")
    return this.http.post<ConsultaAvisosResponse>(`${this.urlServiciosIngresos}serviciosAvisos/consultaAvisos`,JSON.stringify(structData),{headers})
      .pipe(
        catchError(error => { return throwError( error ) })
      );
  }
  messageAttended(messageStruct:MessageAtenddedRequest): Observable<GenericResponse> {
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json");
    return this.http.post<GenericResponse>(`${this.urlServiciosIngresos}serviciosAvisos/messageattended`,JSON.stringify(messageStruct),{headers})
      .pipe(
        map(data => {
          return data
        }),
        catchError( err =>{
          return throwError( err );
        })
      );
  }

  sendMailVerifyCode(emialstruct:VerifyEmailsCodes): Observable<GenericResponse>{
    this.doToConnection();
    return this.http.post<GenericResponse>(`${this.urlServiciosIngresos}serviciosAvisos/sendverifycode`,JSON.stringify(emialstruct),{headers:this.headers})
      .pipe(
        map(data => {
          return data
        }),
        catchError( err =>{
          return throwError( err );
        })
      );
  }

  updatePersonalData(dataPersonal:Object): Observable<GenericResponse> {
    this.doToConnection();
    return this.http.post<GenericResponse>(`${this.urlServiciosIngresos}serviciosAvisos/updatedatausersimat`,JSON.stringify(dataPersonal),{headers:this.headers})
      .pipe(
        map(data => {
          return data
        }),
        catchError( err =>{
          return throwError( err );
        })
      );
  }

  requirementDocExhorto(dataPersonal:Object) : Observable<any> {
    this.headers = new HttpHeaders();
    this.headers = this.headers.set("Content-Type", "application/pdf");
    return this.http.get<any>(`${this.urlServiciosIngresos}serviciosOmisos/imprimirExhorto`)
      .pipe(
        map(data => {
          return data
        }),
        catchError( err =>{
          return throwError( err );
        })
      );
  }

  async requirementDocExhortoPromise(dataPersonal:Object) : Promise<any> {
    const headers = new Headers();
    headers.append("Content-Type", "application/pdf");

    const raw = JSON.stringify({
      "no_control": "12345"
    });

    return await fetch(`${this.urlServiciosIngresos}serviciosOmisos/imprimirExhorto`, {method: "GET", headers: headers, redirect: "follow"});
  }

}
