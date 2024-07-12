import { environments } from "@environments/environments";

export class DataDecrypt {

  private readonly secretKey = environments.SECRET_KEY_CRYPTO;

  constructor(private data: string) { }

  async dataDecrypt():Promise<Object> {
    console.log('Valor del Token:___' + this.data);
    try {
      const datadecrypt = CryptoJS.AES.decrypt(this.data, this.secretKey);
      console.log(datadecrypt);
      return JSON.parse(datadecrypt.toString(CryptoJS.enc.Utf8));
    } catch(error) {
      throw new Error('Valid token not returned::'+error);
    }
  }

}
