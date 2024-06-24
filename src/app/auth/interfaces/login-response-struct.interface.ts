import { UserStruct } from "./user-struct.interface";

export interface LoginResponseStruct {
  data: UserStruct;
  success:boolean;
}
