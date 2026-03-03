import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PreferencesService, UserPreferences } from '../../services/preferences.service';

@Component({
    selector: 'app-preferences',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule
    ],
    template: `
    <div class="preferences-container">
      <mat-card class="preferences-card">
        <mat-card-header>
          <mat-card-title>Minhas Preferências</mat-card-title>
          <mat-card-subtitle>Ajuste os parâmetros para o cálculo do seu ciclo de sono</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="prefsForm" (ngSubmit)="save()" class="prefs-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Latência do Sono (minutos)</mat-label>
                <input matInput type="number" formControlName="sleepLatencyMinutes">
                <mat-hint>Tempo médio que você leva para dormir</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Duração do Ciclo (minutos)</mat-label>
                <input matInput type="number" formControlName="cycleLengthMinutes">
                <mat-hint>Padrão: 90 minutos</mat-hint>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Mínimo de Ciclos</mat-label>
                <input matInput type="number" formControlName="minCycles">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Máximo de Ciclos</mat-label>
                <input matInput type="number" formControlName="maxCycles">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Buffer de Segurança (minutos)</mat-label>
              <input matInput type="number" formControlName="bufferMinutes">
              <mat-hint>Tempo extra entre o fim do ciclo e o alarme</mat-hint>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-flat-button color="primary" [disabled]="prefsForm.invalid || loading()" (click)="save()">
            {{ loading() ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
    styles: [`
    .preferences-container {
      max-width: 600px;
      margin: 32px auto;
      padding: 0 16px;
    }
    .preferences-card {
      border-radius: 12px;
    }
    .prefs-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .form-row mat-form-field {
      flex: 1;
      min-width: 200px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class PreferencesComponent implements OnInit {
    private fb = inject(FormBuilder);
    private prefsService = inject(PreferencesService);
    private snack = inject(MatSnackBar);

    prefsForm: FormGroup = this.fb.group({
        sleepLatencyMinutes: [15, [Validators.required, Validators.min(0)]],
        cycleLengthMinutes: [90, [Validators.required, Validators.min(0)]],
        minCycles: [4, [Validators.required, Validators.min(1)]],
        maxCycles: [6, [Validators.required, Validators.min(1)]],
        bufferMinutes: [5, [Validators.required, Validators.min(0)]]
    });

    loading = signal(false);

    ngOnInit() {
        this.loadPreferences();
    }

    loadPreferences() {
        this.loading.set(true);
        this.prefsService.get().subscribe({
            next: (prefs) => {
                this.prefsForm.patchValue(prefs);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading preferences', err);
                this.loading.set(false);
            }
        });
    }

    save() {
        if (this.prefsForm.invalid) return;

        this.loading.set(true);
        this.prefsService.update(this.prefsForm.value).subscribe({
            next: () => {
                this.loading.set(false);
                this.snack.open('Preferências salvas com sucesso!', 'OK', { duration: 3000 });
            },
            error: (err) => {
                this.loading.set(false);
                this.snack.open('Erro ao salvar preferências.', 'Fechar', { duration: 5000 });
            }
        });
    }
}
