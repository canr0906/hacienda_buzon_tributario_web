export interface HistoryPay {
  fkUsuario: number;
  lineaCaptura: string;
  recibo?: string;
  fecha_pago?: Date;
  sistema: number;
}
