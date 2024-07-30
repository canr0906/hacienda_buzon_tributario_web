import { Component, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { DataUpdateComponent } from '@dashboard/components/buzon-contribuyente/data-update/data-update.component';
import { KnowMessageComponent } from '@dashboard/components/buzon-contribuyente/know-message/know-message.component';
import { ShowRequirementDocComponent } from '@dashboard/components/buzon-contribuyente/show-requirement-doc/show-requirement-doc.component';
import { ConsultaAvisosService } from '@dashboard/services/buzon-contribuyente/consulta-avisos.service';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buzon-contribuyente',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    KnowMessageComponent,
    DataUpdateComponent,
    ShowRequirementDocComponent
  ],
  templateUrl: './buzon-contribuyente.component.html',
  styleUrl: './buzon-contribuyente.component.css'
})
export class BuzonContribuyenteComponent implements OnDestroy {

  /* NOTA: CONTROLA LA ACCION SOBRE EL SIDENAV DE ACUERDO A LA ACCION DEL HERMANO TOOLBAR */
  @ViewChild('drawer')
  public changSidenav!: MatDrawer;
  /* message.- SE ENVIA AL HIJO CON EL CONTENIDO DEL MENSAJE */
  public message: string = '';
  /* messageAtended.- SE ENVIA AL HIJO, HE INDICA SI EL MENSJE ES ATENDIDO */
  public messageAtended:number = 0;
  public pkAviso        = signal<number>(0);
  public tIdent         = signal<number>(0);
  public rfc            = signal<string>('');
  public curp           = signal<string>('');
  public sistema        = signal<number>(0);
  public prioridad       = signal<number>(0);

  private avisosService = inject(ConsultaAvisosService);

  public aceptEventAttend:Subject<boolean> = new Subject<boolean>();

  ngOnDestroy(): void {
    this.aceptEventAttend.unsubscribe();
  }

  /*
    SE INVOCA X message-list.component AL DAR CLICK EN UN ROW DE LA TABLA
    MANDA EL CONTENIDO DEL MENSAJE AL know-message.component
  */
  displayContent(pkAviso: number, message:string,tipoIdentificacion:string,rfc:string,curp:string, sistema:string,messgeAttend?:string,prioridad?:string) {//prioridas: number, message:string, url: string, pkAviso: number) {
    this.changSidenav.toggle();
    this.pkAviso.set(pkAviso);
    this.tIdent.set(Number.parseInt(tipoIdentificacion));
    this.rfc.set(rfc);
    this.curp.set(curp);
    //this.prioridad_eval.set(Number.parseInt(prioridad!));
    this.prioridad.set(Number.parseInt(prioridad!));
    /* SE ENVIA EL MENSAJE AL COMPONENTE KNOW-MESSAGE.COMPONENT */
    this.message = message;
    console.log('STAUS DEL MSG: ' + messgeAttend);
    /* SE ENVIA EL MENSAJE AL COMPONENTE KNOW-MESSAGE.COMPONENT */
    this.messageAtended = Number.parseInt(messgeAttend!);
  }

  /*
    RECIBE PARAMETRO DEL HIJO know-message.component E INVOCA EL METODO PARA MARCAR EL AVISO COMOO ATENDIDO
  */
  eventAttended(event:boolean) {
    this.changSidenav.toggle();
    console.log(this.pkAviso())

    if(this.messageAtended == 0) {
      console.log("EL MENSAJE AUN NO ES ANTENDIDO")
      this.checkMessageAttend();
    }
  }

  checkMessageAttend() {
    this.avisosService.messageAttended({"pkAviso":this.pkAviso(), "tipoIdentificacion":this.tIdent(), "rfc":this.rfc(), "curp":this.curp(), "pkSistema":this.sistema()})
      .subscribe({
        next: (response) => {
          console.log("EL MENSAJE SE MARCA COMO ATENDIDO ANTENDIDO")
          if(!response?.success) {
            Swal.fire('Error', response?.data, 'error');
            this.aceptEventAttend.next(false);
          } else {
            this.aceptEventAttend.next(true);
          }
        },
        error: (err) => {
          this.aceptEventAttend.next(false);
          console.log(err);
        }
      });
  }

  eventAttendedDataUpdate() {
    this.changSidenav.toggle();
    this.aceptEventAttend.next(true);
  }
}
