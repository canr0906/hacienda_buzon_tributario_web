export interface VehicleDataResponseStruct {
  data:    TaxpayerBody;
  success: boolean;
  mensaje?: string;
}

export interface TaxpayerBody {
  total:         number;
  conceptos:     Concepto[];
  contribuyente: Contribuyente;
  domicilio:     Domicilio;
  lineaDetalle:  string;
}

export interface Concepto {
  id:              number;
  clave:           string;
  cantidad:        number;
  descripcion:     string;
  ejercicioFiscal: number;
  importe:         number;
  importeUnitario?:number;
  padre?:          number;
  no_hojas?:       number;
  unitario?:       number;
  conceptoArea?:    number;
}

export interface Contribuyente {
  nombre:          string;
  tipoPersona:     string;
  razonSocial?:     string;
  primerApellido:  string;
  segundoApellido: string;
  rfc:             string;
  curp:            string;
  id:              number;
}

export interface Domicilio {
  calle:          string;
  numeroExterior: string;
  numeroInterior: string;
  colonia:        string;
  municipio:      string;
  estado:         string;
  origen?:         string;
  codigoPostal:   string;
  tipoDomicilio?:  string;
  referencia?:     string;
  id:             number;
}
