import { inject } from "@angular/core";
import { AuthServiceService } from "@auth/services/auth-service.service";
import ListErrors from '@shared/data/errors.json';


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
              return this.sessionValidAndEncrypt();
            } else {
              throw {message: `Error ${this.listErrors[1].id}. Repórtelo al CAT`, code: `${this.listErrors[1].id}`}
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
     this.authService.checkAuthStatus()
              .subscribe({
                next:(resp) => {
                  if(resp) {
                    mss = {message: "Ok", success: true}
                  } else {
                    mss = {message: "FALSE", success: false}
                  }
                },
                error: (message) => {
                  mss = message
                  throw message
                },
                complete: () => {}
              });
              console.log(mss)
              return mss
  }


}
