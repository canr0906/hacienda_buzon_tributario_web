import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { LoginResponseStruct } from '@auth/interfaces/login-response-struct.interface';
import {environments } from "@environments/environments";
import { UserStruct } from '@auth/interfaces/user-struct.interface';
import { AuthStatusStruct } from '@auth/interfaces/auth-status-struct.enum';
import { LoginRequestStruct } from '@auth/interfaces/login-request-struct';
import { DataEncrypt } from '@shared/classes/data-encrypt';
import { DataDecrypt } from '@shared/classes/data-decrypt';
import { ResponseGeneral } from '@shared/interfaces/response-general.interfaz';
import { RegisterlUser } from '@auth/interfaces/register-user/register-user-struct.interfaz';
import { RegisterDataResponse } from '@auth/interfaces/register-data-response.interfaz';
import { Concepto } from '../../dashboard/interfaces/smyt/vehicle-data-response-struct';

import ListErrors from '@shared/data/errors.json';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private http = inject(HttpClient);

  private readonly baseUrlApi: string = environments.BASE_URL_APIREST;
  private readonly urlApiRestNest: string = environments.URL_SERVICIOSHACIENDA_NEST;

  private readonly userApiRest: string = environments.USER_SERVER_APIREST;
  private readonly passApiRest: string = environments.PASS_SERVER_APIREST;

  private _currentUser = signal<UserStruct|null>(null);
  private _authStatus = signal<AuthStatusStruct>( AuthStatusStruct.checking );

  // Al mundo exterior
  public currentUser = computed( () => this._currentUser() );
  public authStatus  = computed( () => this._authStatus() );

  private token: string='';
  private user: UserStruct = {} as UserStruct;

  /* LISTA DE ERRORES */
  private listErrors = ListErrors;

  constructor() {
    //this.checkAuthStatus().subscribe(()=>console.log('Se Ejecuta el CheckAuth'));
  }

  /* ALMACENA EN LOCALSTORA LA ESTRUCTURA RETORNADA POR APIREST Y PONE EL STATUS DE DE AUTENTIFICACION EN AUTENTICADO */
  async setAuthentication(user: UserStruct): Promise<boolean> {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatusStruct.authenticated);

    if(!localStorage.getItem('hbtw_user')) {
      let encript = new DataEncrypt(user);
      encript.dataEncript('hbtw_user');
    }

    return true;
  }

  getToken(): string {
    return this.token;
  }
  /* DESENCRIPTA DATOS DE USUARIO Y TOKEN */
  async checkAuthStatusAsync(): Promise<boolean> {
    try {
      this.user = await new DataDecrypt(localStorage.getItem('hbtw_user')!).dataDecrypt().then(response => response[0])
      this.token = await new DataDecrypt(localStorage.getItem('hbtw_token')!).dataDecrypt()
      return true;
    } catch(err) {
      throw err
    }
    return false

  }
  /* METODO OBSERVABLE ENCARGADO DE RENOVAR EL TOKEN, SUSTITUIRLO EN LOCALSTORAGE  */
  checkAuthStatus(): Observable<boolean> {
    const url = `${this.urlApiRestNest}auth/token-renew`;
    let headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json")

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + this.token);

    return this.http.post<LoginResponseStruct>(url,JSON.stringify(this.user),{headers})
      .pipe(
        map(data=>{
          if(!!data.token) {
            new DataEncrypt(data.token).dataEncript('hbtw_token');
            return true;
          }
          return false;
        }),
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
              message = "Error 500, reportelo al CAT e intentelo mas tarde";
            }
            return message;
          });
        })
      )
  }

  login(loginRequest: LoginRequestStruct): Observable<ResponseGeneral> {
    const url = `${this.urlApiRestNest}auth/login`;//miPortalSH/autentificarUsuario`;
    let headers = new HttpHeaders();
    //const body = {"user":email,"pass":password}
    headers = headers.set("Content-Type", "application/json")
    .set("Authorization", "Basic " + btoa(`${this.userApiRest}:${this.passApiRest}`));

    let generalResponse: ResponseGeneral = {} as ResponseGeneral;

    return this.http.post<LoginResponseStruct>(url,JSON.stringify(loginRequest),{headers})
      .pipe(
        map(data => {
          if(Object.keys(data.user).length>0) {
            generalResponse.mensaje = 'ok';
            generalResponse.success= true;
            /* ENVIA DATOS DEL USUARIO PARA ALMACENARLOS EN LOCALTORAGE Y MANEJAR STATUS DE LOGION O NO EN LA APP */
            this.setAuthentication(data.user);
            /* SE ENVIA EL TOKEN PAR SER ALMACENADO EN LOCALTORAGE */
            new DataEncrypt(data.token).dataEncript('hbtw_token');
          }
          return generalResponse;
        }),//({user, token}) => this.setAuthentication(user,token)),
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
              message = "Problemas de comunicación con el servidor, reporte el error 500 al CAT e intentelo mas tarde";
            }
            return message;
          });
        })
      );
  }

  registerTaxPayer(registerUserStruct: RegisterlUser) {
    const url = `${this.urlApiRestNest}auth/register`;
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
    .set("Authorization", "Basic " + btoa(`${this.userApiRest}:${this.passApiRest}`));

    return this.http.post<RegisterDataResponse>(url,JSON.stringify(registerUserStruct),{headers})
      .pipe(
        map(resp => resp),
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
              message = "Problemas de comunicación con el servidor, reporte el error 500 al CAT e intentelo mas tarde";
            }
            return message;
          });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('hbtw_user');
    localStorage.removeItem('hbtw_token');
    localStorage.removeItem('hbtw_general');
    this._currentUser.set(null);
    this._authStatus.set( AuthStatusStruct.notAuthenticated );
  }

}
