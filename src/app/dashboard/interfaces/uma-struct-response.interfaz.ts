export interface UmaStructResponse {
  data: UmaStruct;
  success: boolean;
}

export interface UmaStruct {
  fechaRegistro: Date;
  ejercicio:     string;
  estado:        string;
  pk:            number;
  uma:           number;
}
