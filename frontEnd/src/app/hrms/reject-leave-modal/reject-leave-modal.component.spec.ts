import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectLeaveModalComponent } from './reject-leave-modal.component';

describe('RejectLeaveModalComponent', () => {
  let component: RejectLeaveModalComponent;
  let fixture: ComponentFixture<RejectLeaveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectLeaveModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectLeaveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
