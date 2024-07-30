import { DataEmailStruct } from "@dashboard/interfaces/buzon-contribuyente/data-email-struct.interfaz";
import { DataPhoneStruct } from "@dashboard/interfaces/buzon-contribuyente/data-phone-struct.interfaz";

export class UpdatePersonalData {
  constructor(
    private emails: DataEmailStruct[],
    private phones: DataPhoneStruct[],
    private tipoIdentificacion: number,
    private sistema: number,
    private pkAviso: number,
    private rfc?: string,
    private curp?: string
  ){}
}
