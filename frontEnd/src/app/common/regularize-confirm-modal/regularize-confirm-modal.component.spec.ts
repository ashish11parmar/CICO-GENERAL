import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizeConfirmModalComponent } from './regularize-confirm-modal.component';

describe('RegularizeConfirmModalComponent', () => {
  let component: RegularizeConfirmModalComponent;
  let fixture: ComponentFixture<RegularizeConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegularizeConfirmModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizeConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
