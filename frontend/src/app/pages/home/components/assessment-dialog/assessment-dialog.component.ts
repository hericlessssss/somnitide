import { Component, inject, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

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
    MatIconModule,
    MatRippleModule
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="dialog-container dark-theme">
      <header class="dialog-header glass">
        <div class="header-content">
          <h2 mat-dialog-title>Avaliação do Sono</h2>
          <p class="subtitle">Como foi seu sono hoje?</p>
        </div>
        <button mat-icon-button class="close-btn" (click)="onDismiss()" aria-label="Fechar avaliação">
          <mat-icon>close</mat-icon>
        </button>
      </header>
      
      <mat-dialog-content #scrollContent class="assessment-content">
        <form #f="ngForm" class="assessment-form">
          <!-- Question 1 -->
          <fieldset class="question-group">
            <legend class="question-label">1. Qualidade geral do sono</legend>
            <mat-radio-group [(ngModel)]="answers.q1" name="q1" required class="vertical-radio-group">
              <div *ngFor="let opt of qualityOptions" 
                   class="option-card clickable" 
                   [class.selected]="answers.q1 === opt.value"
                   (click)="setAnswer('q1', opt.value)"
                   matRipple>
                <mat-radio-button [value]="opt.value" style="color: white !important;">
                  <span class="option-label-text" style="color: white !important;">{{ opt.label }}</span>
                </mat-radio-button>
              </div>
            </mat-radio-group>
          </fieldset>

          <!-- Question 2 -->
          <fieldset class="question-group">
            <legend class="question-label">2. Facilidade para pegar no sono</legend>
            <mat-radio-group [(ngModel)]="answers.q2" name="q2" required class="vertical-radio-group">
              <div *ngFor="let opt of sleepEaseOptions" 
                   class="option-card clickable" 
                   [class.selected]="answers.q2 === opt.value"
                   (click)="setAnswer('q2', opt.value)"
                   matRipple>
                <mat-radio-button [value]="opt.value" style="color: white !important;">
                  <span class="option-label-text" style="color: white !important;">{{ opt.label }}</span>
                </mat-radio-button>
              </div>
            </mat-radio-group>
          </fieldset>

          <!-- Question 3 -->
          <fieldset class="question-group">
            <legend class="question-label">3. Interrupções durante a noite</legend>
            <mat-radio-group [(ngModel)]="answers.q3" name="q3" required class="vertical-radio-group">
              <div *ngFor="let opt of interruptionOptions" 
                   class="option-card clickable" 
                   [class.selected]="answers.q3 === opt.value"
                   (click)="setAnswer('q3', opt.value)"
                   matRipple>
                <mat-radio-button [value]="opt.value" style="color: white !important;">
                  <span class="option-label-text" style="color: white !important;">{{ opt.label }}</span>
                </mat-radio-button>
              </div>
            </mat-radio-group>
          </fieldset>

          <!-- Question 4 -->
          <fieldset class="question-group">
            <legend class="question-label">4. Disposição ao acordar</legend>
            <mat-radio-group [(ngModel)]="answers.q4" name="q4" required class="vertical-radio-group">
              <div *ngFor="let opt of energyOptions" 
                   class="option-card clickable" 
                   [class.selected]="answers.q4 === opt.value"
                   (click)="setAnswer('q4', opt.value)"
                   matRipple>
                <mat-radio-button [value]="opt.value" style="color: white !important;">
                  <span class="option-label-text" style="color: white !important;">{{ opt.label }}</span>
                </mat-radio-button>
              </div>
            </mat-radio-group>
          </fieldset>

          <div class="question-group">
            <mat-form-field appearance="outline" [floatLabel]="'always'" class="full-width no-margin premium-field">
              <mat-label>Alguma observação?</mat-label>
              <textarea matInput [(ngModel)]="note" name="note" placeholder="Ex: Tomei café tarde, barulho na rua..."></textarea>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions glass">
        <button mat-flat-button color="primary" class="submit-btn" [disabled]="!f.valid" (click)="onConfirm()">
          CONCLUIR AVALIAÇÃO
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 90vh;
      background: #0B0F14; /* Deepest black for contrast */
      color: var(--color-text);
      overflow: hidden;
      position: relative;
    }

    .glass {
      background: rgba(17, 24, 38, 0.96) !important; /* Almost solid for clear separation */
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      z-index: 10;
    }

    .dialog-header {
      padding: var(--space-xl);
      text-align: center;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .header-content {
      flex: 1;
    }

    .close-btn {
      position: absolute;
      right: 4px;
      top: 4px;
      color: rgba(255, 255, 255, 0.6) !important;
      width: 28px !important;
      height: 28px !important;
      line-height: 28px !important;
      padding: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      min-width: 0 !important;
    }

    .close-btn mat-icon {
      font-size: 15px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .close-btn:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.05);
    }

    h2[mat-dialog-title] {
      margin: 0 !important;
      padding: 0 !important;
      color: var(--color-text) !important;
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 1.4rem;
      letter-spacing: -0.5px;
    }

    .subtitle {
      margin: var(--space-xs) 0 0;
      color: var(--color-text-muted);
      font-size: 0.8rem;
    }

    .assessment-content {
      flex: 1;
      padding: var(--space-xl) !important;
      margin: 0 !important;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
    }

    .assessment-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      padding-bottom: var(--space-xl);
    }

    .question-group {
      border: none;
      padding: 0;
      margin: 0;
    }

    .question-label {
      display: block;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: var(--space-md);
      font-size: 0.9rem;
      font-family: var(--font-title);
    }

    .vertical-radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .option-card {
      background: #1A2234; /* Lighter than dialog background for depth */
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: var(--space-sm) var(--space-md);
      transition: all var(--transition-fast);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .option-card:hover {
      background: #252D3F;
      border-color: rgba(66, 214, 198, 0.4);
    }

    .option-card.selected {
      background: rgba(66, 214, 198, 0.25) !important; /* Slightly more visible */
      border-color: var(--color-primary) !important;
      border-width: 2px;
      box-shadow: 0 0 20px var(--color-primary-glow);
    }

    .option-card mat-radio-button {
      width: 100%;
    }

    .assessment-dialog-backdrop {
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      background-color: rgba(0, 0, 0, 0.4) !important;
    }

    /* Customizing Material Radio to match theme - ULTIMATE SPECIFICITY */
    app-assessment-dialog {
      .mat-mdc-radio-button,
      .mat-mdc-radio-button *,
      .mdc-radio,
      .mdc-radio *,
      .mdc-label,
      .option-label-text {
        color: #FFFFFF !important;
      }

      .mat-mdc-radio-button {
        --mdc-radio-selected-focus-icon-color: #FFFFFF !important;
        --mdc-radio-selected-hover-icon-color: #FFFFFF !important;
        --mdc-radio-selected-icon-color: #FFFFFF !important;
        --mdc-radio-selected-pressed-icon-color: #FFFFFF !important;
        --mdc-radio-unselected-focus-icon-color: rgba(255, 255, 255, 0.7) !important;
        --mdc-radio-unselected-hover-icon-color: rgba(255, 255, 255, 0.7) !important;
        --mdc-radio-unselected-icon-color: rgba(255, 255, 255, 0.7) !important;
        --mdc-radio-unselected-pressed-icon-color: rgba(255, 255, 255, 0.7) !important;
      }
      
      .mat-mdc-radio-button .mdc-radio__outer-circle {
        border-color: rgba(255, 255, 255, 0.7) !important;
      }
      
      .mat-mdc-radio-button.mat-mdc-radio-checked .mdc-radio__outer-circle {
        border-color: #FFFFFF !important;
      }

      .mat-mdc-radio-button.mat-mdc-radio-checked .mdc-radio__inner-circle {
        border-color: #FFFFFF !important;
        background-color: #FFFFFF !important;
      }

      .mat-mdc-radio-button .mdc-label {
        color: #FFFFFF !important;
        opacity: 1 !important;
      }
    }

    .premium-field {
      margin-top: var(--space-xl);
      --mdc-filled-textfield-container-color: var(--color-surface-2);
    }

    :host ::ng-deep .mat-mdc-form-field-flex {
      padding-top: 8px !important;
    }

    .dialog-actions {
      padding: var(--space-lg) var(--space-xl);
      padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom));
      border-top: 1px solid var(--color-border);
      margin: 0 !important;
      flex-shrink: 0;
    }

    .submit-btn {
      width: 100%;
      height: 56px !important;
      border-radius: var(--radius-md) !important;
      font-weight: 700 !important;
      letter-spacing: 0.5px !important;
      background: var(--color-primary) !important;
      color: #000 !important;
      transition: transform var(--transition-fast) !important;
    }

    .submit-btn:not(:disabled):active {
      transform: scale(0.98);
    }

    .submit-btn:disabled {
      opacity: 0.5 !important;
      background: var(--color-text-muted) !important;
    }

    .full-width {
      width: 100%;
    }
    .no-margin {
      margin-bottom: 0;
    }
  `
})
export class AssessmentDialogComponent implements AfterViewInit {
  private dialogRef = inject(MatDialogRef<AssessmentDialogComponent>);

  @ViewChild('scrollContent', { read: ElementRef }) scrollContent!: ElementRef;

  answers: {
    q1: number | null,
    q2: number | null,
    q3: number | null,
    q4: number | null
  } = {
      q1: null,
      q2: null,
      q3: null,
      q4: null
    };
  note: string = '';

  qualityOptions = [
    { value: 0, label: 'Muito ruim' },
    { value: 1, label: 'Ruim' },
    { value: 2, label: 'Regular' },
    { value: 3, label: 'Boa' },
    { value: 4, label: 'Excelente' }
  ];

  sleepEaseOptions = [
    { value: 0, label: 'Muito difícil' },
    { value: 1, label: 'Difícil' },
    { value: 2, label: 'Normal' },
    { value: 3, label: 'Fácil' },
    { value: 4, label: 'Muito fácil' }
  ];

  interruptionOptions = [
    { value: 0, label: 'Acordei muitas vezes' },
    { value: 1, label: 'Acordei algumas vezes' },
    { value: 2, label: 'Acordei uma vez' },
    { value: 3, label: 'Quase não acordei' },
    { value: 4, label: 'Dormi direto' }
  ];

  energyOptions = [
    { value: 0, label: 'Exausto' },
    { value: 1, label: 'Cansado' },
    { value: 2, label: 'Normal' },
    { value: 3, label: 'Disposto' },
    { value: 4, label: 'Totalmente revigorado' }
  ];

  setAnswer(question: 'q1' | 'q2' | 'q3' | 'q4', value: number) {
    this.answers[question] = value;
  }

  ngAfterViewInit() {
    // Force scroll to top when dialog opens
    // Using setTimeout to ensure it happens after any internal Material focus logic
    setTimeout(() => {
      if (this.scrollContent) {
        this.scrollContent.nativeElement.scrollTop = 0;
      }
    }, 0);
  }

  onDismiss() {
    if (window.confirm('Deseja mesmo cancelar? Suas respostas não serão salvas.')) {
      this.dialogRef.close();
    }
  }

  onConfirm() {
    const totalPoints = (this.answers.q1 ?? 0) +
      (this.answers.q2 ?? 0) +
      (this.answers.q3 ?? 0) +
      (this.answers.q4 ?? 0);

    // Scale for 4 questions (max 16 pts) to 1-5 stars
    let rating = 1;
    if (totalPoints >= 14) rating = 5;
    else if (totalPoints >= 11) rating = 4;
    else if (totalPoints >= 8) rating = 3;
    else if (totalPoints >= 4) rating = 2;

    this.dialogRef.close({
      qualityRating: rating,
      note: this.note || 'Sem observações'
    });
  }
}
