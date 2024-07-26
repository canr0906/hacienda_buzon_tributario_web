import { VehicleDataRequestStruct } from "@dashboard/interfaces/smyt/vehicle-data-request-struct";
import { StorageDataParentStruct } from "./storage-data-parent-struct.interfaz";
import { VehicleDataResponseStruct } from "@dashboard/interfaces/smyt/vehicle-data-response-struct";
import {PolizaDataResponse} from "@dashboard/interfaces/smyt/poliza-data-response.interfaz"
import { DataServiceGeneralRequest } from "@dashboard/interfaces/data-service-general-request.interfaz";

export interface StorageDataStruct {
  hbtw_idParent?: StorageDataParentStruct[];
  hbtw_gestora?: string;
  hbtw_route_origen?: string;
  hbtw_concept?: string;
  hbtw_vehicle_data?: VehicleDataRequestStruct;
  hbtw_contribuyente?: VehicleDataResponseStruct;
  hbtw_datos_poliza?: PolizaDataResponse;

  hbtw_contribuyente_only?: string;
  hbtw_vehicle_data_adicional?: string;
  hbtw_datos_cobro?: DataServiceGeneralRequest;
}
