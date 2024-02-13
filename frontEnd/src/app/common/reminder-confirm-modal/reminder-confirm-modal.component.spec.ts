import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderConfirmModalComponent } from './reminder-confirm-modal.component';

describe('ReminderConfirmModalComponent', () => {
  let component: ReminderConfirmModalComponent;
  let fixture: ComponentFixture<ReminderConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReminderConfirmModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReminderConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
