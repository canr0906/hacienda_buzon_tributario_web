import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ConsultaAvisosRequest } from '@dashboard/interfaces/buzon-contribuyente/consulta-avisos-request.interfaz';
import { StructDisplayTable } from '@dashboard/interfaces/buzon-contribuyente/struct-display-table.interfaz';
import { LayoutDashComponent } from '@dashboard/layout/layout-dash.component';
import { ConsultaAvisosService } from '@dashboard/services/buzon-contribuyente/consulta-avisos.service';
import { environments } from '@environments/environments';
import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import { BuzonContribuyenteComponent } from '../buzon-contribuyente.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [
    CommonModule,MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, LoadSpinnerComponent
  ],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.css'
})
export class MessagesListComponent implements AfterViewInit, OnInit {

  displayedColumns: string[] = ['id', 'mensaje', 'prioridad', 'url', 'mensajeAtendido', 'pkAviso', 'accion'];
  dataSource!: MatTableDataSource<StructDisplayTable>;

  private consultaAvisosService = inject(ConsultaAvisosService);
  private activeRoute = inject(ActivatedRoute);
  private structConsultaAviso:ConsultaAvisosRequest = {} as ConsultaAvisosRequest;
  private arrDataSource = signal<StructDisplayTable[]>([]);//: StructDisplayTable = {} as StructDisplayTable;
  /*  CARGA EL COMPONENTE PARA EMITIR VALORES AL DAR CLICK EN ALGUN ROW DE LA TABLA*/
  private parentLayout = inject(BuzonContribuyenteComponent);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor() {}

  ngOnInit(): void {
    this.activeRoute.params.subscribe(({sistema, tipoIdent, incGeneral, credential}) => {
        localStorage.setItem('hbt_tipoidentificaion',tipoIdent);
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
        this.structConsultaAviso.tipoIdentificacion = tipoIdent;

        this.searchMessages();
    });
  }

  ngAfterViewInit() {
    /*
      SE QUEDA EN ESCUCHA SI CAMBIA EL VALOR DEL REGISTRO SELECCIONADO, SI SE MARCO COMO LEIDO SE LANZA CONSULTA, POR ESO ES QUE SE DISPARA CADA QUE SE PICA
      UN RENGLON, SE CREAN SUSCRIPCIONES POR CADA CLIC
    */
      this.parentLayout.aceptEventAttend.subscribe({
        next:(event)=>{
          if(event) {
            console.log("Se Invoca a SEARCHMESSAGE")
            this.searchMessages(true);
          }
          console.log('EVENT:' + event);
        }
      })
  }

  searchMessages(flag:boolean=false) {
    if(flag) {
      this.arrDataSource.set([]);
    }
    this.consultaAvisosService.getConsultaAvisos(this.structConsultaAviso)
      .subscribe({
        next: (result) => {
          if(result?.success && Object.keys(result.data).length){
            console.log('Is: ' + Object.keys(result.data).length)
          }
          let icon = 'mail';
          let increment = 1
          result?.data.forEach(({mensaje,prioridad,mensajeAtendido,url,pkAviso})=>{
            if(mensajeAtendido=='1'){
              icon = 'drafts'
            } else {
              icon = 'mail'
            }
            this.arrDataSource.update(() => [...this.arrDataSource(),
            {
              id:increment,
              mensaje:mensaje,
              prioridad:prioridad,
              url:url,
              mensajeAtendido:mensajeAtendido,
              pkAviso:Number.parseInt(pkAviso),
              accion:icon
            }]);
            increment++;
          });
          // Assign the data to the data source for the table to render
          this.dataSource = new MatTableDataSource(this.arrDataSource());

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        complete: () => {
          console.log([]);
        },
        error: (error) => {
          Swal.fire('Error', error, 'error');
          throw error;
         }
      });
  }

  applyFilter(event: Event) {
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
  displayActtion(pkAviso: number, mensaje:string,mensajeAtendido:string,prioridad:string) {
    if(Number.parseInt(mensajeAtendido) == 1 && Number.parseInt(prioridad)==1) {
      Swal.fire(
        {
          icon: "info",
          title: 'LA ACTUALIZACIÓN DE INFORMACIÓN YA FUE ATENDIDA',
          showConfirmButton: false,
          timer: 2500
        }
      );
      return;
    }
    this.parentLayout.displayContent(pkAviso, mensaje, this.structConsultaAviso.tipoIdentificacion,this.structConsultaAviso.rfc,this.structConsultaAviso.curp, this.structConsultaAviso.sistema,mensajeAtendido,prioridad);//prioridas, mensaje, url, pkAviso);

  }
}
