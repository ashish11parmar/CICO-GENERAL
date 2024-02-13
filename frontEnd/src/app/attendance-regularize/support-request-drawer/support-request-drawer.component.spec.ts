import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportRequestDrawerComponent } from './support-request-drawer.component';

describe('SupportRequestDrawerComponent', () => {
  let component: SupportRequestDrawerComponent;
  let fixture: ComponentFixture<SupportRequestDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupportRequestDrawerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportRequestDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
