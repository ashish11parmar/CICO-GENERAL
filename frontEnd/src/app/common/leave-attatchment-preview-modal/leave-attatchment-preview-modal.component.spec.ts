import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveAttatchmentPreviewModalComponent } from './leave-attatchment-preview-modal.component';

describe('LeaveAttatchmentPreviewModalComponent', () => {
  let component: LeaveAttatchmentPreviewModalComponent;
  let fixture: ComponentFixture<LeaveAttatchmentPreviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveAttatchmentPreviewModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveAttatchmentPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
