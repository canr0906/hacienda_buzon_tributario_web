import { Component, inject, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
//import { AuthService } from '../../services/auth-service.service';
import { Router, RouterModule  } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '@auth/services/auth-service.service';
import { LoginRequestStruct } from '@auth/interfaces/login-request-struct';
import Swal from 'sweetalert2';
import { ValidationService } from '@auth/services/validation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
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

  private fb = inject(FormBuilder);
  public myForm: FormGroup = this.fb.group(
    {
      rfc: ['', [Validators.required]], //Validators.email] ],
      curp: ['', [Validators.required]],
      password: ['12345', [Validators.required, Validators.minLength(5)]]
    },
    {
      validators: [this.validationService.validatorsFactory('curp','rfc')]
    }
  );

  login(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }
    const { user, password } = this.myForm.value;
    if(this.myForm.get('curp')?.valid && this.myForm.get('curp')?.value !== '') {
      this.tipo_identificaion.set("2");
    }
    this.loginRequest.set({rfc:this.myForm.get('rfc')?.value,curp:this.myForm.get('curp')?.value,tipo_identificacion:this.tipo_identificaion(),password:this.myForm.get('password')?.value});//update(() => [...this.loginRequest(),this.myForm.value]);
    console.log(this.loginRequest())
    this.authService.login(this.loginRequest())
      .subscribe({
        next: (resp) => {
          if (resp.success) {
            this.router.navigateByUrl('dashboard');
            return;
          }
          Swal.fire('Error', String(resp.data.mensaje), 'error');
        },
        error: (message) => {
          Swal.fire('Error', message, 'error');
        }
      });
  }
}
