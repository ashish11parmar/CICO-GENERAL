import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarLeaveModalComponent } from './calendar-leave-modal.component';

describe('CalendarLeaveModalComponent', () => {
  let component: CalendarLeaveModalComponent;
  let fixture: ComponentFixture<CalendarLeaveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarLeaveModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarLeaveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
