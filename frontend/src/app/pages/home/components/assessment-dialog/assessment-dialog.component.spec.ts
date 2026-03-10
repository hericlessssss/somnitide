import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AssessmentDialogComponent } from './assessment-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AssessmentDialogComponent', () => {
    let component: AssessmentDialogComponent;
    let fixture: ComponentFixture<AssessmentDialogComponent>;
    let mockDialogRef: any;

    beforeEach(async () => {
        mockDialogRef = {
            close: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [AssessmentDialogComponent, NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AssessmentDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have all 4 questions', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const questions = compiled.querySelectorAll('.question-group');
        // 4 questions + 1 note field = 5 groups
        expect(questions.length).toBe(5);
    });

    it('should disable submit button if form is invalid', async () => {
        const fixture = TestBed.createComponent(AssessmentDialogComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const submitBtn = compiled.querySelector('.submit-btn') as HTMLButtonElement;
        expect(submitBtn.disabled).toBe(true);
    });

    it('should enable submit button after answering all questions', async () => {
        const fixture = TestBed.createComponent(AssessmentDialogComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        const questionGroups = Array.from(compiled.querySelectorAll('.vertical-radio-group'));
        
        // Click on the first option of each question
        for (const group of questionGroups) {
            const firstOption = group.querySelector('.option-card') as HTMLElement;
            firstOption.click();
            fixture.detectChanges();
        }

        await fixture.whenStable();
        fixture.detectChanges();
        
        const submitBtn = compiled.querySelector('.submit-btn') as HTMLButtonElement;
        expect(submitBtn.disabled).toBe(false);
    });

    it('should close dialog with results on confirm', async () => {
        const fixture = TestBed.createComponent(AssessmentDialogComponent);
        const component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();

        component.answers.q1 = 4;
        component.answers.q2 = 4;
        component.answers.q3 = 4;
        component.answers.q4 = 4;
        component.note = 'Tudo ótimo';
        
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        component.onConfirm();
        
        expect(mockDialogRef.close).toHaveBeenCalledWith({
            qualityRating: 5,
            note: 'Tudo ótimo'
        });
    });
});
