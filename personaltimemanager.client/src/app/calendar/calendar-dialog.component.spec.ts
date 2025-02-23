import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDialogComponent } from './calendar-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CalendarModule } from 'primeng/calendar';
import { HttpClientModule } from '@angular/common/http';

describe('CalendarDialogComponent', () => {
  let component: CalendarDialogComponent;
  let fixture: ComponentFixture<CalendarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarDialogComponent],
      imports: [MatDialogModule, CalendarModule, HttpClientModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
