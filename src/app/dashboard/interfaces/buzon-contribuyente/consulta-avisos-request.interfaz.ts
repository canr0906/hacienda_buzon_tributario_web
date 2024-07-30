export interface ConsultaAvisosRequest {
  sistema:            string;
  tipoIdentificacion: string;
  rfc:                string;
  curp:               string;
  incluirGenerales:   string;
  registro:           number;
  noRegistro:         number;
}
