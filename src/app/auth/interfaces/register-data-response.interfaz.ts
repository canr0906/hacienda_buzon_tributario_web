import { UserStruct } from "./user-struct.interface";

export interface RegisterDataResponse {
  user:UserStruct;
  success: boolean;
}
