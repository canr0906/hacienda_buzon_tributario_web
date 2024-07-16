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

  constructor() {
    this.checkAuthStatus().subscribe(()=>console.log('Se Ejecuta el CheckAuth'));
  }

  /* ALMACENA EN LOCALSTORA LA ESTRUCTURA RETORNADA POR APIREST Y PONE EL STATUS DE DE AUTENTIFICACION EN AUTENTICADO */
  async setAuthentication(user: UserStruct): Promise<boolean> {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatusStruct.authenticated);

    if(!sessionStorage.getItem('hbtw_user')) {
      let encript = new DataEncrypt(user);
      encript.dataEncript('hbtw_user');
    }

    return true;
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrlApi}/auth/check-token`;
    const token = localStorage.getItem('user');//sessionStorage.getItem('token');

    if(!token) {
      this.logout();
      return of(false);
    }

    return of(true);
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
        tap(resp => console.log(resp)),
        map(data => {
          if(Object.keys(data.user).length>0) {
            generalResponse.mensaje = 'ok';
            generalResponse.success= true;
            /* ENVIA DATOS DEL USUARIO PARA ALMACENARLOS EN SESSIONSTORAGE Y MANEJAR STATUS DE LOGION O NO EN LA APP */
            this.setAuthentication(data.user);
            /* SE ENVIA EL TOKEN PAR SER ALMACENADO EN SESSIONSTORAGE */
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

  registerTaxPayer() {

  }

  logout(): void {
    sessionStorage.clear();
    this._currentUser.set(null);
    this._authStatus.set( AuthStatusStruct.notAuthenticated );
  }

}
