export interface PolizaDataResponse {
  success: boolean;
  poliza:  Poliza;
  data?:   string;
}

export interface Poliza {
  fechaVencimiento: string;
  numeroPoliza:     string;
  lineaCaptura:     string;
  total:            number;
}
