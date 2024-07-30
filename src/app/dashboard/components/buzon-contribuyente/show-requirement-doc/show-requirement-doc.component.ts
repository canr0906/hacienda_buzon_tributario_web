import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConsultaAvisosService } from '@dashboard/services/buzon-contribuyente/consulta-avisos.service';
import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'buzon-show-requirement-doc',
  standalone: true,
  imports: [CommonModule, LoadSpinnerComponent, MatCardModule, MatDividerModule,MatIconModule,MatButtonModule,MatTooltipModule],
  templateUrl: './show-requirement-doc.component.html',
  styleUrl: './show-requirement-doc.component.css'
})
export class ShowRequirementDocComponent implements OnInit, OnDestroy {

  private avisosService = inject(ConsultaAvisosService);

  public dataLocalUrl: string ='';

  /* BLOQUEA BOTON QUE CIERRA EL SIDE-NAVE LATERAL */
  public lockButton = signal<boolean>(true);

  /* CONTROLA EL LOADING CUANDO SE ENVIA EL CODIGO DE VERIFICACION */
  public statusShowDoc = signal<boolean>(false);

  /* ENVIA EL STATUS AL PADRE layout-dash.component PARA QUE SE CAMBIE EL STATUS DE LA NOTIFICACION */
  @Output()
  public flagAttended = new EventEmitter<boolean>();

  /* RECIBE DEL PADRE EL SATUS DE MENSAJE ATENDIDO O NO  */
  @Input()
  public messageAtended: number = 0;

  public sizeDisplay!: string;
  destroyed = new Subject<void>();
  private displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  constructor(private breakpointObserver: BreakpointObserver) {
    this.mediaQuery();
  }

  ngOnInit(): void {
    this.statusShowDoc.set(true);
    this.avisosService.requirementDocExhorto('12345')
      .subscribe({
        next: (resp) => {
          console.log("YA TENGO RESPUESTA ")
          window.document.getElementById('ifrm')!.setAttribute("data", 'data:application/pdf;base64,'+resp.data);
          this.statusShowDoc.set(false);
          this.lockButton.set(false);
          /*if(this.messageAtended==0) {
            this.eventAttended();
          }*/
        }
      })
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /* CONTROLA EL EVENTO CLICK SOBRE BOTON DE ATENDIDO. flagAttended ENVIA UN VALOR DE CONOCIMIENTO DE CLICK AL PADRE layaout.dash */
  eventAttended() {
    this.flagAttended.emit(true);
  }

  public mediaQuery() {

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.sizeDisplay = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });
  }
}
