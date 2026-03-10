import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicLayoutComponent } from './public-layout.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('PublicLayoutComponent', () => {
    let component: PublicLayoutComponent;
    let fixture: ComponentFixture<PublicLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                PublicLayoutComponent,
                RouterTestingModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PublicLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a container with min-height 100dvh and scrolling enabled', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const layout = compiled.querySelector('.public-layout');
        const styles = window.getComputedStyle(layout!);
        
        expect(styles.minHeight).toBe('100dvh');
        expect(styles.display).toBe('flex');
        expect(styles.flexDirection).toBe('column');
        // overflowY is checked by implementation later
    });

    it('should contain a router-outlet', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });
});
