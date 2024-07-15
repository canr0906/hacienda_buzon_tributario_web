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
      await encript.dataEncript('hbtw_user')
        .then(resp =>{
          console.log()
        });
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
            this.setAuthentication(data.user)
            new DataEncrypt(data.token).dataEncript('token')
              .then(resp=>{
                if(resp) {
                  generalResponse.mensaje = "Logeo Exitoso";
                  generalResponse.success = true;
                } else {
                  generalResponse.mensaje = "Error en Login";
                  generalResponse.success = false;
                }
              });
          }
          console.log(generalResponse)
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

  logout(): void {
    //sessionStorage.removeItem('token');//localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('gestora_admin');
    localStorage.removeItem('route_origen_admin');
    localStorage.removeItem('concept_admin');
    localStorage.removeItem('vehicle_data_admin');
    localStorage.removeItem('vehicle_data_adicional_admin');
    localStorage.removeItem('contribuyente_admin');
    localStorage.removeItem('datos_poliza_admin');
    localStorage.removeItem('idParent_admin');
    this._currentUser.set(null);
    this._authStatus.set( AuthStatusStruct.notAuthenticated );
  }

}
