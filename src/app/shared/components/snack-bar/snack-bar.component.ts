import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'hacienda-snack-bar',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="card">
      <div class="flex justify-content-center flex-wrap">
        <mat-icon aria-hidden="false" aria-label="Example home icon">
          notifications
        </mat-icon>
        <p class="information">
            <strong>Notificación</strong><br>
            <span [innerHTML]="data"></span>
        </p>
        <span matSnackBarActions>
          <button mat-button matSnackBarAction (click)="sbRef.dismissWithAction()" style="color: white;">
          <mat-icon>close</mat-icon>
          </button>
        </span>
      </div>
    </div>
  `
})
export class SnackBarComponent {
  constructor(
    public sbRef: MatSnackBarRef<SnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}
}
