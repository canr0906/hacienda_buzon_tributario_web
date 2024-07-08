import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { VehicleDataComponent } from '@dashboard/components/smyt/vehicle-data/vehicle-data.component';
import { SmytService } from '@dashboard/services/smyt/smyt.service';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';
import { SnackBarComponent } from '@shared/components/snack-bar/snack-bar.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LoadSpinnerComponent,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    VehicleDataComponent
  ],
  templateUrl: './refrendo.component.html',
  styleUrl: './refrendo.component.css'
})
export class RefrendoComponent implements OnInit,AfterContentInit {

  private fb           = inject(FormBuilder);
  private smytService  = inject(SmytService);
  private router       = inject(Router);
  private _snackBar    = inject(MatSnackBar);

  //Controla la visualización del Spinner
  public isLoading = signal<boolean>(false);
  public conceptTitle = signal<string>('');

  public myForm: FormGroup = this.fb.group({});

  @ViewChild(VehicleDataComponent)
  private childComponent!: VehicleDataComponent;

  ngOnInit(): void {
    this.conceptTitle.set(localStorage.getItem('concept_admin')!);
  }
  ngAfterContentInit(): void {
    setTimeout(() => {
      this.myForm.addControl('primary_form', this.childComponent.myFormSmyt);
      this.childComponent.myFormSmyt.setParent(this.myForm);

      this.myForm.markAllAsTouched();

      this.myForm.get('primary_form')!.get('placa')!.enable();
    },200);
  }

  onSubmit(): void {
    this.isLoading.set(true);
    if (this.myForm.invalid) {
      this.isLoading.set(false);
      return;
    }
    const reqData = {
      "placa": this.myForm.get('primary_form')?.get('placa')?.value,
      "tramite": 1,
      "obtenerContribuyente": true
    }
    localStorage.setItem('vehicle_data_admin', JSON.stringify(reqData));
    this.smytService.validateVehicle(reqData)
      .subscribe(resp => {
        if (resp?.success) {
          this.router.navigate(['/dashboard/tabla-conceptos',1]);
          return
        }
        this._snackBar.openFromComponent(SnackBarComponent, {
          data: resp?.data,
          duration: 3000,panelClass: ["snack-notification"],horizontalPosition: "center",verticalPosition: "top",
        });

        this.isLoading.set(false);
      });
  }

}
