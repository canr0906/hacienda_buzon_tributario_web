export interface MunicipiosResponseStruct {
  data:    listaMunicipiosStruct[];
  success: boolean;
}

export interface listaMunicipiosStruct {
  pk:          number;
  descripcion: string;
}
