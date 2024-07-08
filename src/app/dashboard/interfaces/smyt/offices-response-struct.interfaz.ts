export interface OfficesResponseStruct {
  success: boolean;
  data:    OfficeDataStruct[];
}

export interface OfficeDataStruct {
  pkdmgCOficina: number;
  descripcion:   string;
  status:        number;
}
