export interface DataServiceGeneralRequest {
  cantidad:             number;
  monto:                number;
  idConcepto?:          number;
  folio?:               number;
  anio?:                number;
  semestre?:            number;
  certificacion?:       number;
  tipo_form?:           number;
  fecha_verificacion?:  Date;
  placa?:               string;
  serie?:               string
  actualizacion?:       string;
  recargo?:             number;
  periodo?:             number;
  ejercicio?:           number;
  fechaVencimiento?:     Date;
  sistema?:              number;
}
