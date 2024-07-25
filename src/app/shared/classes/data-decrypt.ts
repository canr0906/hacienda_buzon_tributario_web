import { environments } from "@environments/environments";
import CryptoJS from "crypto-js";
import ListErrors from '@shared/data/errors.json';

export class DataDecrypt {

  private readonly secretKey = environments.SECRET_KEY_CRYPTO;
  private listErrors = ListErrors;

  constructor(private data: string) { }

  async dataDecrypt():Promise<any> {
    try {
      const datadecrypt = CryptoJS.AES.decrypt(this.data, this.secretKey);
      const stringData = JSON.parse(datadecrypt.toString(CryptoJS.enc.Utf8));
      return stringData;
    } catch(error) {
      throw {"message": `Error ${this.listErrors[0].id}, sección Desencriptación de Datos. Repórtelo al CAT`, "error": "Unauthorized", "statusCode": 401}
    }
  }

}
