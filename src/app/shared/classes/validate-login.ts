import { inject } from "@angular/core";
import { AuthServiceService } from "@auth/services/auth-service.service";
import ListErrors from '@shared/data/errors.json';
import { lastValueFrom, throwError } from "rxjs";


export class ValidateLogin {

  private listErrors           = ListErrors;
  private status = {status:"STATUSSSS"};

  constructor(private authService: AuthServiceService){}

  async validateSession(): Promise<any>{

      if(!!localStorage.getItem('hbtw_token')) {
        try {
          return await this.authService.checkAuthStatusAsync()
          .then(result => {
            console.log(result)
            if(result) {
              /* OBSERVABLE QUE RENUEVA EL TOKEN */
              return lastValueFrom( this.authService.checkAuthStatus() )
                .then(resp => {
                  if(resp) {
                    return {message: "ok", success: true}
                  }
                  return {message: `Error ${this.listErrors[2]} seccion Validar Login. Repórtelo al CAT e intentelo mas tarde`, success: false}
                }).catch(err =>{
                  console.log(err)
                  throw err
                });
            } else {
              throw {"message": `Error ${this.listErrors[1].id}. Repórtelo al CAT`, "error": "Unauthorized", "statusCode": `${this.listErrors[1].id}`} //{message: `Error ${this.listErrors[1].id}. Repórtelo al CAT`, code: `${this.listErrors[1].id}`}
            }
          })
          .catch(error=>{
            console.log(error)
            throw error;
          });
        }catch(err){
          console.log(err)
          throw err;
        }
      }
      return {message: "Usuario no Logueado", success: false}
  }

  sessionValidAndEncrypt() {
    let mss;

              console.log(mss)
              return mss
  }


}
