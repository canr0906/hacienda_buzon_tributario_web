import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { HistoricoPagosStruct } from '@dashboard/interfaces/historico-pagos/historico-pagos-struct.interfaz';
import { HistoricoPagosService } from '@dashboard/services/historico-pagos/historico-pagos.service';
import { DataDecrypt } from '@shared/classes/data-decrypt';
import { ValidateLogin } from '@shared/classes/validate-login';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import Swal from 'sweetalert2';
import ListErrors from '@shared/data/errors.json';

@Component({
  selector: 'app-historico-pagos',
  standalone: true,
  imports: [CommonModule,MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, LoadSpinnerComponent],
  templateUrl: './historico-pagos.component.html',
  styleUrl: './historico-pagos.component.css'
})
export class HistoricoPagosComponent implements OnInit {

  displayedColumns: string[] = ['lineacaptura', 'recibo', 'fechaPago', 'accion'];
  dataSource!: MatTableDataSource<HistoricoPagosStruct>;

  private activeRoute       = inject(ActivatedRoute);
  private serviceHistotyPay = inject(HistoricoPagosService);
  private authService       = inject(AuthServiceService);
  private router            = inject(Router);

  private arrDataSource  = signal<HistoricoPagosStruct[]>([]);
  public isAuthenticated = signal<boolean>(false);
  public isLoading       = signal<boolean>(false);
  private listErrors     = ListErrors;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.activeRoute.params.subscribe(({sistema, tipoIdent, incGeneral, credential}) => {
        /*localStorage.setItem('hbt_tipoidentificaion',tipoIdent);
        localStorage.setItem('hbt_sistema',sistema);
        localStorage.setItem('hbt_credencial',credential);

        this.structConsultaAviso.incluirGenerales = incGeneral;
        this.structConsultaAviso.noRegistro = environments.NO_REGISTROS;
        this.structConsultaAviso.registro = 0;
        if(Number.parseInt(tipoIdent)==1) {
          this.structConsultaAviso.rfc = credential;
          this.structConsultaAviso.curp = 'null';
        } else {
          this.structConsultaAviso.rfc = 'null';
          this.structConsultaAviso.curp = credential;
        }
        this.structConsultaAviso.sistema = sistema;
        this.structConsultaAviso.tipoIdentificacion = tipoIdent;*/

        /* INICIO: METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN */
        new ValidateLogin(this.authService).validateSession()
          .then((resp:any)=> {
            if(resp.success) {
              this.isAuthenticated.set(true);
              /* METODO INTERNO PARA OBTENER LISTA DE PAGOS */
              this.serviceHistotyPay.getHistoryPayList(this.authService.getUSer().pkUser!,this.authService.getToken())
                .subscribe({
                  next:(resp) => {
                    console.log(resp)
                    resp.data.forEach((element:HistoricoPagosStruct) => {
                      this.arrDataSource.update(() => [...this.arrDataSource(),
                        {
                          lineaCaptura:element.lineaCaptura,
                          recibo:element.recibo,
                          fechaPago:element.fechaPago,
                          accion:'cloud_download'
                        }]);
                    });

                      console.log(this.arrDataSource())
                    // Assign the data to the data source for the table to render
                    this.dataSource = new MatTableDataSource(this.arrDataSource());
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                  },
                  error:(err)=>{
                    console.log(err)
                    this.isLoading.set(false);
                    Swal.fire({icon: "error", title: "Error!!", text: err, allowOutsideClick:false})
                      .then(()=>{ this.router.navigate(['dashboard/portal-hacienda-servicios']); });
                  }
                });
            } else {
              Swal.fire({icon: "error", title: `Error: ${this.listErrors[10].id}`, text: `${this.listErrors[10].type}. Repórtelo al CAT e intente mas tarde`, allowOutsideClick:false})
              .then(()=>{
                this.authService.logout();
                this.router.navigate(['auth']);
              });
            }
          })
          .catch(err=>{
            this.isLoading.set(false);
            Swal.fire({icon: "error", title: `Error: ${err.statusCode}`, text: `${err.message}. Repórtelo al CAT e intente mas tarde`, allowOutsideClick:false})
              .then(()=>{
                this.authService.logout();
                this.router.navigate(['auth']);
              });
          });
        /* FIN */
    });
  }


  /*
    AL DAR CLICK SOBRE CUALQUIER ROW DE LANZA EL METODO
    SE INVOCA EL METODO displayContent DE layout-dash.componet PRECIAMENTE INYECTADO
  */
  displayActtion(lineaCaptura: string) {
    window.open('https://app.hacienda.morelos.gob.mx/recibo/cfd/imprimirCfd?lineaCaptura='+lineaCaptura);
    return;
  }

}
