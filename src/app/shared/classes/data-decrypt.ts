import { environments } from "@environments/environments";
import CryptoJS from "crypto-js";

export class DataDecrypt {

  private readonly secretKey = environments.SECRET_KEY_CRYPTO;

  constructor(private data: string) { }

  async dataDecrypt():Promise<Object> {
    try {
      const datadecrypt = CryptoJS.AES.decrypt(this.data, this.secretKey);
      const stringData = JSON.parse(datadecrypt.toString(CryptoJS.enc.Utf8));
      return stringData;
    } catch(error) {
      throw new Error('Valid token not returned::'+error);
    }
  }

}
