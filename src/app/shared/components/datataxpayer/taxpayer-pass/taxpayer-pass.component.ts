import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'hacienda-taxpayer-pass',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './taxpayer-pass.component.html',
  styleUrl: './taxpayer-pass.component.css'
})
export class TaxpayerPassComponent {

  private fb = inject(FormBuilder);
  public formTaxPayPass: FormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confpass: ['', [Validators.required]]
  });
}
