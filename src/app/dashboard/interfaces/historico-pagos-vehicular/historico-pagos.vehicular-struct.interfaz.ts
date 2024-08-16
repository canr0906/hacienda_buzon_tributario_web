export interface HistoricPayVehicleResponse {
  data: HistoricoPagosVehicularStruct[]
  success:boolean;
}
export interface HistoricoPagosVehicularStruct {
  concepto:       string;
  ejercicioFiscal:number;
  recibo:         string;
  fechaPago:      Date
}
