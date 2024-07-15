import { Component, HostListener, inject, signal } from '@angular/core';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';

import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

//import { AuthService } from '../../services/auth-service.service';
import { Router, RouterModule  } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { LoginRequestStruct } from '@auth/interfaces/login-request-struct';
import Swal from 'sweetalert2';
import { ValidationService } from '@auth/services/validation.service';
import { ResponseGeneral } from '@shared/interfaces/response-general.interfaz';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    LoadSpinnerComponent,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private authService = inject(AuthServiceService);
  private validationService = inject(ValidationService)
  private router = inject(Router);
  private tipo_identificaion = signal<string>('1');

  private loginRequest = signal<LoginRequestStruct>({} as LoginRequestStruct);

  public slideToggleControl = signal<boolean>(false);

  /* CONTROLA LA VISUALIZACION DEL SPINNER */
  public isLoading = signal<boolean>(false);

  private fb = inject(FormBuilder);
  public myForm: FormGroup = this.fb.group(
    {
      rfc: ['', [Validators.required]], //Validators.email] ],
      curp: [{value: '', disabled: true}, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    }
  );

  @HostListener('input', ['$event']) onKeyUp(event: any) {
    event.target['value'] = event.target['value'].toUpperCase();
  }

  login(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const { user, password } = this.myForm.value;
    if(this.myForm.get('curp')?.valid && this.myForm.get('curp')?.value !== '') {
      this.tipo_identificaion.set("2");
    }
    this.loginRequest.set({rfc:this.myForm.get('rfc')?.value,curp:this.myForm.get('curp')?.value,tipo_identificacion:this.tipo_identificaion(),password:this.myForm.get('password')?.value});//update(() => [...this.loginRequest(),this.myForm.value]);
    console.log(this.loginRequest())
    this.authService.login(this.loginRequest())
      .subscribe({
        next: (resp) => {
          this.isLoading.set(false);
          console.log( sessionStorage.getItem('hbtw_token') )
          console.log(resp.success)
          if(resp.success) {
            this.router.navigateByUrl('dashboard/sevices-menu');
            return;
          }
          Swal.fire('Error', "No se encontro informacion con las credenciales proporcionadas.", 'error');
        },
        error: (message) => {
          this.isLoading.set(false);
          Swal.fire('Error', message, 'error');
        },
        complete: () => {
          console.log(sessionStorage.getItem('hbtw_token'))
          console.log("TERMINO LA EJECUSION")
        }
      });
  }

  changeTaxData(event:boolean) {
    this.slideToggleControl.set(event);
    if(event) {
      this.disabledEnabledElement(['rfc'],['curp']);
      this.myForm.get('observaciones')?.enable();
      return;
    }
    this.disabledEnabledElement(['curp'],['rfc']);
      return;
  }

  disabledEnabledElement(element:string[],enabledElement:string[]) {
    element.forEach(element => {
      this.myForm.get(element)?.disable();
    });
    enabledElement.forEach(element => {
      this.myForm.get(element)?.enable();
    });
  }
}
