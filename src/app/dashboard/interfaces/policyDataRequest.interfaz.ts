export interface PolicyData {
  sistema:             string;
  movimiento:          string;
  total:               number;
  rfc:                 string;
  nombre:              string;
  primerApellido:      string;
  segundoApellido:     string;
  razonSocial:         string;
  tipoPersona:         string;
  origen:              string;
  calle:               string;
  numeroExterior:      string;
  numeroInterior:      string;
  colonia:             string;
  municipio:           string;
  estado:              string;
  codigoPostal:        number;
  referenciaDomicilio: string;
  observaciones:       string;
  datosAdicionales:    string;
  detalle:             string;
  fechaVencimiento?:   string;
}
