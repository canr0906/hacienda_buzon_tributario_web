export interface ConsultaAvisosResponse {
  data:    ConsultaAvisosStruct[];
  success: boolean;
}

export interface ConsultaAvisosStruct {
  url:                string;
  avisosObligatorios: string;
  mensajeAtendido:    string;
  avisosInformativos: string;
  mensaje:            string;
  prioridad:          string;
  totalAvisos:        string;
  tipoMensaje:        string;
  pkAviso:            string;
}
