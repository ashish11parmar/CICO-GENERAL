import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizeComponent } from './attendance-regularize.component';

describe('AttendanceRegularizeComponent', () => {
  let component: AttendanceRegularizeComponent;
  let fixture: ComponentFixture<AttendanceRegularizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceRegularizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
