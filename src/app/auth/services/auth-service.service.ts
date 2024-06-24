import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { LoginResponseStruct } from '@auth/interfaces/login-response-struct.interface';
import {environments } from "@environments/environments";
import { UserStruct } from '@auth/interfaces/user-struct.interface';
import { AuthStatusStruct } from '@auth/interfaces/auth-status-struct.enum';
import { LoginRequestStruct } from '@auth/interfaces/login-request-struct';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private http = inject(HttpClient);

  private readonly baseUrlApi: string = environments.BASE_URL_APIREST;

  private _currentUser = signal<UserStruct|null>(null);
  private _authStatus = signal<AuthStatusStruct>( AuthStatusStruct.checking );

  // Al mundo exterior
  public currentUser = computed( () => this._currentUser() );
  public authStatus  = computed( () => this._authStatus() );

  constructor() {
    this.checkAuthStatus().subscribe(()=>console.log('Se Ejecuta el CheckAuth'));
  }

  /* ALMACENA EN LOCALSTORA LA ESTRUCTURA RETORNADA POR APIREST Y PONE EL STATUS DE DE AUTENTIFICACION EN AUTENTICADO */
  private setAuthentication(user: UserStruct): boolean {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatusStruct.authenticated);

    if(!localStorage.getItem('user')) {
      localStorage.setItem('user',JSON.stringify(user));
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

  login(loginRequest: LoginRequestStruct): Observable<LoginResponseStruct> {
    const url = `${this.baseUrlApi}miPortalSH/autentificarUsuario`;
    let headers = new HttpHeaders();
    //const body = {"user":email,"pass":password}
    headers = headers.set("Content-Type", "application/json")
    //.set("Authorization", "Basic " + btoa(`${environments.USER_SERVER}:${environments.PASS_SERVER}`));
    return this.http.post<LoginResponseStruct>(url,JSON.stringify(loginRequest),{headers})
      .pipe(
        tap(resp => console.log(resp)),
        map(data => {
          if(data.success) {
            this.setAuthentication(data.data)
          }
          return data
        }),//({user, token}) => this.setAuthentication(user,token)),
        //TODO: Errores
        catchError( err =>{
          return throwError( () => 'Error en la petición al servidor ');
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
