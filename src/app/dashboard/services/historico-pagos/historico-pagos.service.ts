import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments } from '@environments/environments';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoricoPagosService {

  private http = inject(HttpClient);
  private urlServiciosIngresos = environments.URL_SERVICIOSHACIENDA_NEST;
  private headers!:HttpHeaders;

  constructor() { }

  doToConnection(token:string) {
    this.headers = new HttpHeaders();
    this.headers = this.headers.set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + token);
  }

  getHistoryPayList(pkUser:string,token:string): Observable<any> {
    this.doToConnection(token);

    return this.http.post<any>(`${this.urlServiciosIngresos}auth/history-pay-list`,JSON.stringify({pkUser:pkUser}),{headers:this.headers})
      .pipe(
        catchError(error => { return throwError( error ) })
      );
  }
}
