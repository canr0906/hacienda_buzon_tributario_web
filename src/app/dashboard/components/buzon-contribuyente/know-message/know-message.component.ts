import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'buzon-know-message',
  standalone: true,
  imports: [MatButtonModule, MatCardModule,MatDividerModule,MatIconModule],
  templateUrl: './know-message.component.html',
  styleUrl: './know-message.component.css'
})
export class KnowMessageComponent {
  @Input()
  public message: string = '';

  @Input()
  public messageAtended: number = 0;

  @Output()
  public flagAttended = new EventEmitter<boolean>();

  /*
    CONTROLA EL EVENTO CLICK SOBRE BOTON DE ATENDIDO. flagAttended ENCIA UN VALOR DE CONOCIMIENTO DE CLICK AL PADRE layaout.dash
  */
  eventAttended() {
    this.flagAttended.emit(true);
  }
}
