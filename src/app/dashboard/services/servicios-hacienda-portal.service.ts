import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConceptsResponseStruct, DataConceptsStruct } from '@shared/interfaces/concepts-response-struct.interface';
import { environments } from '@environments/environments';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosHaciendaPortalService {

  private readonly baseUrlApi: string = environments.BASE_URL_SERVHACIENDA;
  private readonly userServiceHacienda: string = environments.USER_SERVER_APIREST;
  private readonly passServiceHacienda: string = environments.PASS_SERVER_APIREST;


  private http = inject(HttpClient);

  public conceptoStorage: DataConceptsStruct[] = [];

  constructor() {
    //this.loadFromLocalStorage();
  }

  deleteLocalStorage(): void {
    this.conceptoStorage = [];
  }

  /*loadFromLocalStorage(): void {
    if ( !localStorage.getItem('cachestore') ) return ;
    this.conceptoStorage = JSON.parse(localStorage.getItem('cachestore')!);
  }*/

  /* DESCOMENTAR ESTE METODO SI SE VA A CONSUMIR POR SERVICIO Y COMENTAR SU COPIA */
  requestConceptos(id: number): Observable<DataConceptsStruct[]> {
    this.deleteLocalStorage();
    let headers = new HttpHeaders();

    headers = headers.set("Content-Type", "application/json")
      .set("Authorization", "Basic " + btoa(`${this.userServiceHacienda}:${this.passServiceHacienda}`));

    const body = {"pk":id}

    return this.http.post<ConceptsResponseStruct>(`${this.baseUrlApi}serviciosHacienda/concepto/menuConceptos`,
      JSON.stringify(body),{headers})
    .pipe(
      map(resp => resp.data),
      catchError(error => of([])),
    );



  }

  async getDetalleCobroISAN(importe:number, fecha:string, idConcepto:number): Promise<any> {
    console.log(importe + ' | ' + fecha + ' | ' + idConcepto)
    return await fetch(`${this.baseUrlApi}conceptos/services/isan`, {
      method: "POST",
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imp="http://impuestos/"><soapenv:Header/><soapenv:Body><imp:obtenerRezagosActualizacionAdicionales><!--Optional:--><idConcepto>${idConcepto}</idConcepto><!--Optional:--><importe>${importe}</importe><!--Optional:--><fecha>${fecha}</fecha></imp:obtenerRezagosActualizacionAdicionales></soapenv:Body></soapenv:Envelope>`,
      headers: { "Content-type": "text/xml; charset=utf-8"},
      redirect: "follow"
    });
  }
}
