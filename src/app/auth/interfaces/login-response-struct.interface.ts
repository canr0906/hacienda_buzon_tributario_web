import { UserStruct } from "./user-struct.interface";

export interface LoginResponseStruct {
  user: UserStruct;
  token:string;
}
