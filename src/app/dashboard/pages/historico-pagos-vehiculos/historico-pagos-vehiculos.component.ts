import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { HistoricPayVehicleRequest } from '@dashboard/interfaces/historico-pagos-vehicular/historic-pay-vehicle.request.interfaz';
import { HistoricoPagosVehicularStruct } from '@dashboard/interfaces/historico-pagos-vehicular/historico-pagos.vehicular-struct.interfaz';
import { LayoutDashComponent } from '@dashboard/layout/layout-dash.component';
import { SmytService } from '@dashboard/services/smyt/smyt.service';
import { LoadSpinnerComponent } from '@shared/components/load-spinner/load-spinner.component';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-historico-pagos-vehiculos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    LoadSpinnerComponent,
    MatCardModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './historico-pagos-vehiculos.component.html',
  styleUrl: './historico-pagos-vehiculos.component.css'
})
export class HistoricoPagosVehiculosComponent implements OnInit {

  displayedColumns: string[] = ['concepto', 'ejercicio_fiscal', 'recibo', 'fechaPago'];
  dataSource: MatTableDataSource<HistoricoPagosVehicularStruct> = new MatTableDataSource();


  private fb            = inject(FormBuilder);
  /* INJECTA LAYOUT PARA PODER INTERACTUAL CON SUS METODOS */
  private parentLayout  = inject(LayoutDashComponent);
  private smytSevices   = inject(SmytService);
  private authService   = inject(AuthServiceService);
  private router        = inject(Router);

  public isLoading       = signal<boolean>(false);
  private arrDataSource  = signal<HistoricoPagosVehicularStruct[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('THPV') table!: ElementRef;

  public myFormHistoricVehicle: FormGroup = this.fb.group({
    placa: ['', [Validators.required]],
    serie: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.parentLayout.showoptions.set(true);
    this.parentLayout.showoptionsMenu.set(false);

  }

  findPagosVehicular() {
    const dataVehicle: HistoricPayVehicleRequest = {} as HistoricPayVehicleRequest;
    dataVehicle.placa = this.myFormHistoricVehicle.get('placa')?.value;
    dataVehicle.serie = this.myFormHistoricVehicle.get('serie')?.value;
    /* METODO INTERNO PARA OBTENER LISTA DE PAGOS */
    this.smytSevices.getHistoryPayList(this.authService.getToken(),dataVehicle)
    .subscribe({
      next:(resp) => {
        console.log(resp)
        this.arrDataSource.set(resp.data);
        this.dataSource = new MatTableDataSource(this.arrDataSource());
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error:(err)=>{
        console.log(err)
        this.isLoading.set(false);
        Swal.fire({icon: "error", title: "Error!!", text: err.error.message, allowOutsideClick:false})
          .then(()=>{ });
      }
    });
  }

  exportAsExcel()
    {
      const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, 'SheetJS.xlsx');

    }

}
