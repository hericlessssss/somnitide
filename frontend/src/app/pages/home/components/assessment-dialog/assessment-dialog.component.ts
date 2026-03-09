import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface AssessmentResult {
  qualityRating: number;
  note: string;
}

@Component({
  selector: 'app-assessment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Avaliação do Sono</h2>
        <p class="subtitle">Como foi seu descanso hoje?</p>
      </div>
      
      <mat-dialog-content class="assessment-content">
        <form #f="ngForm">
          <!-- Question 1 -->
          <div class="question-group">
            <label class="question-label">1. Qualidade geral do sono</label>
            <mat-radio-group [(ngModel)]="answers.q1" name="q1" required class="vertical-radio-group">
              <mat-radio-button [value]="0">Muito ruim</mat-radio-button>
              <mat-radio-button [value]="1">Ruim</mat-radio-button>
              <mat-radio-button [value]="2">Regular</mat-radio-button>
              <mat-radio-button [value]="3">Boa</mat-radio-button>
              <mat-radio-button [value]="4">Excelente</mat-radio-button>
            </mat-radio-group>
          </div>

          <!-- Question 2 -->
          <div class="question-group">
            <label class="question-label">2. Facilidade para pegar no sono</label>
            <mat-radio-group [(ngModel)]="answers.q2" name="q2" required class="vertical-radio-group">
              <mat-radio-button [value]="0">Muito difícil</mat-radio-button>
              <mat-radio-button [value]="1">Difícil</mat-radio-button>
              <mat-radio-button [value]="2">Normal</mat-radio-button>
              <mat-radio-button [value]="3">Fácil</mat-radio-button>
              <mat-radio-button [value]="4">Muito fácil</mat-radio-button>
            </mat-radio-group>
          </div>

          <!-- Question 3 -->
          <div class="question-group">
            <label class="question-label">3. Interrupções durante a noite</label>
            <mat-radio-group [(ngModel)]="answers.q3" name="q3" required class="vertical-radio-group">
              <mat-radio-button [value]="0">Acordei muitas vezes</mat-radio-button>
              <mat-radio-button [value]="1">Acordei algumas vezes</mat-radio-button>
              <mat-radio-button [value]="2">Acordei uma vez</mat-radio-button>
              <mat-radio-button [value]="3">Quase não acordei</mat-radio-button>
              <mat-radio-button [value]="4">Dormi direto</mat-radio-button>
            </mat-radio-group>
          </div>

          <!-- Question 4 -->
          <div class="question-group">
            <label class="question-label">4. Disposição ao acordar</label>
            <mat-radio-group [(ngModel)]="answers.q4" name="q4" required class="vertical-radio-group">
              <mat-radio-button [value]="0">Exausto</mat-radio-button>
              <mat-radio-button [value]="1">Cansado</mat-radio-button>
              <mat-radio-button [value]="2">Normal</mat-radio-button>
              <mat-radio-button [value]="3">Disposto</mat-radio-button>
              <mat-radio-button [value]="4">Totalmente revigorado</mat-radio-button>
            </mat-radio-group>
          </div>

          <div class="question-group">
            <mat-form-field appearance="outline" class="full-width no-margin">
              <mat-label>Alguma observação?</mat-label>
              <textarea matInput [(ngModel)]="note" name="note" placeholder="Ex: Tomei café tarde, barulho na rua..."></textarea>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="center" class="dialog-actions">
        <button mat-flat-button color="primary" class="submit-btn" [disabled]="!f.valid" (click)="onConfirm()">
          CONCLUIR AVALIAÇÃO
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .dialog-container {
      padding: 0;
      overflow: hidden;
    }
    .dialog-header {
      padding: 24px 24px 16px;
      text-align: center;
      background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
      color: white;
    }
    h2[mat-dialog-title] {
      margin: 0;
      color: white !important;
      font-weight: 300;
      font-size: 1.8rem;
    }
    .subtitle {
      margin: 4px 0 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }
    .assessment-content {
      max-height: 60vh;
      padding: 24px;
      margin: 0;
    }
    .question-group {
      margin-bottom: 32px;
    }
    .question-label {
      display: block;
      font-weight: 500;
      color: #1a237e;
      margin-bottom: 12px;
      font-size: 1.05rem;
    }
    .vertical-radio-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    mat-radio-button {
      padding: 10px 16px;
      border-radius: 12px;
      transition: all 0.2s ease;
      background-color: #f8f9fa;
      border: 1px solid transparent;
    }
    mat-radio-button:hover {
      background-color: #f0f2f5;
      border-color: #e0e0e0;
    }
    mat-radio-button.mat-mdc-radio-checked {
      background-color: #e8eaf6;
      border-color: #3f51b5;
    }
    .full-width {
      width: 100%;
    }
    .no-margin {
      margin-bottom: 0;
    }
    .dialog-actions {
      padding: 24px;
      background-color: #f8f9fa;
      border-top: 1px solid #eee;
    }
    .submit-btn {
      width: 100%;
      height: 54px;
      border-radius: 27px;
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 1px;
      box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
    }
    .submit-btn:disabled {
      opacity: 0.6;
    }
  `
})
export class AssessmentDialogComponent {
  private dialogRef = inject(MatDialogRef<AssessmentDialogComponent>);

  answers = {
    q1: null,
    q2: null,
    q3: null,
    q4: null
  };
  note: string = '';

  onConfirm() {
    const totalPoints = (this.answers.q1 || 0) +
      (this.answers.q2 || 0) +
      (this.answers.q3 || 0) +
      (this.answers.q4 || 0);

    // Scale for 4 questions (max 16 pts) to 1-5 stars
    let rating = 1;
    if (totalPoints >= 14) rating = 5;
    else if (totalPoints >= 11) rating = 4;
    else if (totalPoints >= 8) rating = 3;
    else if (totalPoints >= 4) rating = 2;

    this.dialogRef.close({
      qualityRating: rating,
      note: this.note || 'Avaliação concluída'
    });
  }
}
