import { UserStruct } from "@auth/interfaces/user-struct.interface";
import {environments } from "@environments/environments";

import CryptoJS from "crypto-js";

export class DataEncrypt {

  private readonly secretKey = environments.SECRET_KEY_CRYPTO;

  constructor(private dataStruct: Object) { }

  async dataEncript(nameLocal:string):Promise<boolean|null> {
    try {
      const dataencrypt = CryptoJS.AES.encrypt(JSON.stringify(this.dataStruct), this.secretKey).toString();
      localStorage.setItem(nameLocal,dataencrypt);
      return true;
    } catch(error) {
      throw new Error('No fue posible almacenar la información de manera local, favor de contactar al CAT e intentarlo nuevmanete ');
    }
  }

}
