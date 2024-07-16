import { ConcesionUSerStruct } from "./concesion-user-struct.interfaz";
import { EmailUSerStruct } from "./email-user-struct.interfaz";
import { PhoneUSerStruct } from "./phone-user-struct.interfaz";
import { TaxUSerStruct } from "./tax-user-struct.interfaz";
import { VehicleUSerStruct } from "./vehicle-user-struct.interfaz";

export interface RegisterlUser {
  tipo: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rfc: string;
  curp: string;
  tipo_identificacion: number;
  password: string;
  sistema: number;
  entidad: number;
  municipio: number;
  colonia: string;
  cp: number;
  calle: string;
  no_int: string;
  no_ext: string;

  correosList:     EmailUSerStruct[];
  telefonosList:   PhoneUSerStruct[];
  impuestosList:   TaxUSerStruct[];
  vehiculosList:   VehicleUSerStruct[];
  concesionesList: ConcesionUSerStruct[];
}
