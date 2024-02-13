import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderConfigureComponent } from './reminder-configure.component';

describe('ReminderConfigureComponent', () => {
  let component: ReminderConfigureComponent;
  let fixture: ComponentFixture<ReminderConfigureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReminderConfigureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReminderConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
