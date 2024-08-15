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
import { LayoutDashComponent } from '@dashboard/layout/layout-dash.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-historico-pagos',
  standalone: true,
  imports: [CommonModule,MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, LoadSpinnerComponent,MatCardModule,MatDividerModule],
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
  /* INJECTA LAYOUT PARA PODER INTERACTUAL CON SUS METODOS */
  private parentLayout      = inject(LayoutDashComponent);

  private arrDataSource  = signal<HistoricoPagosStruct[]>([]);
  public isAuthenticated = signal<boolean>(false);
  public isLoading       = signal<boolean>(false);
  public nameTaxed       = signal<string>('');
  private listErrors     = ListErrors;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.parentLayout.showoptions.set(true);
    this.parentLayout.showoptionsMenu.set(false);

    this.activeRoute.params.subscribe(({sistema, tipoIdent, incGeneral, credential}) => {
        /* INICIO: METODO ASINCRONO QUE DESENCRIPTA DATOS DE USUARIO Y TOKEN */
        new ValidateLogin(this.authService).validateSession()
          .then((resp:any)=> {
            if(resp.success) {
              this.isAuthenticated.set(true);
              this.nameTaxed.set(`${this.authService.getUSer().nombre!} ${this.authService.getUSer().apellido_paterno!} ${this.authService.getUSer().apellido_materno!}`);
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

  filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
