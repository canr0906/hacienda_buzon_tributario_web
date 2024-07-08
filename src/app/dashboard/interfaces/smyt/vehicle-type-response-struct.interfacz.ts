export interface VehicleTypeResponseStruct {
  success: boolean;
  data:    VehicleTypeDataStruct[];
}

export interface VehicleTypeDataStruct {
  pkdmgCTipovehiculo: number;
  descripcion:   string;
  status:        number;
}
